import * as acorn from 'acorn';

export function transpile(codeStr) {
  let ast;
  try {
    ast = acorn.parse(codeStr, { ecmaVersion: 2020, locations: true });
  } catch (e) {
    throw new Error(`Syntax Error: ${e.message}`);
  }

  // Find the function node
  let funcNode = null;
  let isClassMethod = false;
  let methodName = "";

  // Helper to find function in AST
  for (const node of ast.body) {
    if (node.type === 'FunctionDeclaration') {
      funcNode = node;
      break;
    } else if (node.type === 'VariableDeclaration') {
      const decl = node.declarations[0];
      if (decl && decl.init && (decl.init.type === 'FunctionExpression' || decl.init.type === 'ArrowFunctionExpression')) {
        funcNode = decl.init;
        break;
      }
    } else if (node.type === 'ClassDeclaration') {
      // Find method definition inside class
      const methods = node.body.body.filter(m => m.type === 'MethodDefinition');
      if (methods.length > 0) {
        funcNode = methods[0].value; // FunctionExpression
        isClassMethod = true;
        methodName = methods[0].key.name;
        break;
      }
    }
  }

  // Fallback: If no function wrapper is found, let's wrap the code in a dummy function
  if (!funcNode) {
    const wrappedCode = `function solve() {\n${codeStr}\n}`;
    return transpile(wrappedCode);
  }

  const body = funcNode.body;
  if (body.type !== 'BlockStatement') {
    throw new Error("Function must be enclosed in curly braces { }");
  }

  // Find all variable declarations in the function scope
  const variables = new Set();
  const params = funcNode.params.map(p => {
    if (p.type === 'Identifier') return p.name;
    if (p.type === 'AssignmentPattern' && p.left.type === 'Identifier') return p.left.name;
    return null;
  }).filter(Boolean);

  function findDeclarations(node) {
    if (!node) return;
    if (node.type === 'VariableDeclaration') {
      node.declarations.forEach(decl => {
        if (decl.id.type === 'Identifier') {
          variables.add(decl.id.name);
        } else if (decl.id.type === 'ObjectPattern') {
          // e.g., const { val, next } = curr;
          decl.id.properties.forEach(prop => {
            if (prop.value && prop.value.type === 'Identifier') {
              variables.add(prop.value.name);
            }
          });
        } else if (decl.id.type === 'ArrayPattern') {
          // e.g., const [a, b] = arr;
          decl.id.elements.forEach(el => {
            if (el && el.type === 'Identifier') {
              variables.add(el.name);
            }
          });
        }
      });
    }
    // Traverse children nodes
    for (let key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach(child => {
            if (child && typeof child.type === 'string') {
              findDeclarations(child);
            }
          });
        } else if (typeof node[key].type === 'string') {
          findDeclarations(node[key]);
        }
      }
    }
  }

  findDeclarations(body);

  const allVars = [...params, ...variables];
  
  const insertions = [];

  // Inject local variable initializers and state capture function at the beginning of the body
  const bodyStartIdx = body.start + 1; // right after '{'
  const localDeclarations = Array.from(variables).map(v => `let ${v};`).join(' ');
  const getStateFunction = `
    const __getState = () => {
      const state = {};
      [${allVars.map(v => `'${v}'`).join(',')}].forEach(v => {
        try {
          const val = eval(v);
          if (val instanceof Map) {
            state[v] = { type: 'Map', value: Array.from(val.entries()) };
          } else if (val instanceof Set) {
            state[v] = { type: 'Set', value: Array.from(val) };
          } else if (typeof val === 'object' && val !== null) {
            // Clone objects to freeze state at this point in time
            state[v] = { type: 'Object', value: JSON.parse(JSON.stringify(val)) };
          } else {
            state[v] = { type: 'Primitive', value: val };
          }
        } catch(e) {
          state[v] = { type: 'Undefined', value: undefined };
        }
      });
      return state;
    };
  `;

  insertions.push({
    index: bodyStartIdx,
    text: `\n  ${localDeclarations}\n  ${getStateFunction}\n`
  });

  // Remove variable keywords: 'let', 'const', 'var' to prevent redeclaration warnings
  function modifyDeclarations(node) {
    if (!node) return;
    if (node.type === 'VariableDeclaration') {
      const length = node.kind.length;
      insertions.push({
        index: node.start,
        length: length + 1,
        text: ' '.repeat(length + 1)
      });
    }
    for (let key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach(child => {
            if (child && typeof child.type === 'string') {
              modifyDeclarations(child);
            }
          });
        } else if (typeof node[key].type === 'string') {
          modifyDeclarations(node[key]);
        }
      }
    }
  }
  modifyDeclarations(body);

  // Insert yield statements before every executing statement
  function insertYields(node) {
    if (!node) return;
    
    const statementTypes = [
      'ExpressionStatement',
      'ReturnStatement',
      'IfStatement',
      'WhileStatement',
      'ForStatement',
      'VariableDeclaration'
    ];

    if (statementTypes.includes(node.type)) {
      const lineNum = node.loc.start.line;
      insertions.push({
        index: node.start,
        text: `yield { line: ${lineNum}, state: __getState() };\n      `
      });
    }

    if (node.type === 'BlockStatement') {
      node.body.forEach(insertYields);
    } else if (node.type === 'IfStatement') {
      insertYields(node.consequent);
      if (node.alternate) insertYields(node.alternate);
    } else if (node.type === 'WhileStatement' || node.type === 'ForStatement') {
      insertYields(node.body);
    } else {
      for (let key in node) {
        if (node[key] && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            node[key].forEach(child => {
              if (child && typeof child.type === 'string') {
                insertYields(child);
              }
            });
          } else if (typeof node[key].type === 'string') {
            insertYields(node[key]);
          }
        }
      }
    }
  }

  body.body.forEach(insertYields);

  // Apply insertions/deletions in reverse order to prevent index shifts
  const sortedInsertions = insertions.sort((a, b) => b.index - a.index);
  
  let newCode = codeStr;
  sortedInsertions.forEach(ins => {
    const start = ins.index;
    const length = ins.length || 0;
    newCode = newCode.slice(0, start) + ins.text + newCode.slice(start + length);
  });

  // Convert function to a generator function
  if (isClassMethod) {
    // If it's a class method definition (e.g. `twoSum(nums) { ... }`), rewrite it as a generator method: `*twoSum(nums) { ... }`
    const methodIdx = newCode.indexOf(methodName);
    if (methodIdx !== -1) {
      newCode = newCode.slice(0, methodIdx) + '*' + newCode.slice(methodIdx);
    }
  } else if (funcNode.type === 'ArrowFunctionExpression') {
    // If it's an arrow function, convert it to a standard generator function syntax.
    // Replace `(...) => {` with `function* (...) {`
    const arrowIdx = newCode.indexOf('=>');
    const paramStart = funcNode.params[0] ? funcNode.params[0].start : newCode.indexOf('(');
    if (arrowIdx !== -1 && paramStart !== -1) {
      const paramsText = newCode.slice(paramStart, arrowIdx).trim();
      newCode = `function* ${paramsText} ${newCode.slice(arrowIdx + 2)}`;
    }
  } else {
    // If it's a standard function declaration/expression, insert *
    const funcWordIdx = newCode.indexOf('function');
    if (funcWordIdx !== -1) {
      newCode = newCode.slice(0, funcWordIdx + 8) + '*' + newCode.slice(funcWordIdx + 8);
    }
  }

  return newCode;
}

export function executeTracer(codeStr, paramsArray) {
  try {
    const transpiledCode = transpile(codeStr);
    
    // Evaluate the code to get the generator function
    const generatorCreator = new Function('return ' + transpiledCode)();
    
    // Instantiate the generator with our parameters
    const generator = generatorCreator(...paramsArray);
    
    // Run the generator and capture all steps
    const steps = [];
    let step = generator.next();
    let limit = 0;
    
    while (!step.done && limit < 300) {
      steps.push({
        line: step.value.line,
        state: step.value.state
      });
      step = generator.next();
      limit++;
    }

    return {
      success: true,
      steps,
      returnValue: step.value,
      transpiledCode
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
