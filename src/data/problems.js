export const problems = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    leetcodeUrl: "https://leetcode.com/problems/two-sum/",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
    prerequisites: ["arrays", "hash-maps"],
    naiveApproach: {
      title: "Brute Force (Nested Loops)",
      description: "Iterate through each element `i` and check if there exists another element `j` at a later index such that `nums[i] + nums[j] == target`.",
      complexity: "Time: O(N²), Space: O(1)",
    },
    optimalApproach: {
      title: "One-Pass Hash Map",
      description: "While traversing the array, compute the required complement (`target - nums[i]`). Check if the complement is present in a Hash Map. If it is, we have found our pair and return their indices. Otherwise, insert the current number and its index into the Hash Map.",
      complexity: "Time: O(N), Space: O(N)",
    },
    starterCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    presetInputs: [
      { name: "Default (Target = 9)", params: [[2, 7, 11, 15], 9] },
      { name: "Target in Middle (Target = 6)", params: [[3, 2, 4], 6] },
      { name: "Duplicate Values (Target = 6)", params: [[3, 3], 6] }
    ]
  },
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    category: "Binary Search",
    leetcodeUrl: "https://leetcode.com/problems/binary-search/",
    description: "Given a sorted (in ascending order) integer array `nums` and a `target` value, search for the target. If target exists, return its index. Otherwise, return `-1`.",
    prerequisites: ["arrays", "binary-search"],
    naiveApproach: {
      title: "Linear Search",
      description: "Iterate through the array from index `0` to `n-1` and check if any element matches the target.",
      complexity: "Time: O(N), Space: O(1)",
    },
    optimalApproach: {
      title: "Binary Search (Divide and Conquer)",
      description: "Maintain two pointers: `low` (start of search range) and `high` (end). In each step, compute `mid = floor((low + high) / 2)`. If `nums[mid] == target`, return `mid`. If target is smaller, search the left half by setting `high = mid - 1`. If target is larger, search the right half by setting `low = mid + 1`.",
      complexity: "Time: O(log N), Space: O(1)",
    },
    starterCode: `function binarySearch(nums, target) {
  let low = 0;
  let high = nums.length - 1;
  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return -1;
}`,
    presetInputs: [
      { name: "Target Found (Target = 9)", params: [[-1, 0, 3, 5, 9, 12], 9] },
      { name: "Target Not Found (Target = 2)", params: [[-1, 0, 3, 5, 9, 12], 2] },
      { name: "Single Element Found (Target = 5)", params: [[5], 5] }
    ]
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stacks",
    leetcodeUrl: "https://leetcode.com/problems/valid-parentheses/",
    description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid by checking if brackets close in the correct order and with the same type.",
    prerequisites: ["stacks", "strings"],
    naiveApproach: {
      title: "String Replacement",
      description: "Repeatedly replace occurrences of adjacent matching pairs `()`, `[]`, `{}` with empty strings until the string stops shrinking. If empty, it's valid.",
      complexity: "Time: O(N²), Space: O(N) due to string allocation",
    },
    optimalApproach: {
      title: "Stack Data Structure",
      description: "Iterate through the string. When encountering an opening bracket, push it onto a Stack. When encountering a closing bracket, pop the top element from the Stack and verify it matches the current closing bracket. If it doesn't match or the stack is empty, return false. After parsing the string, the stack must be empty for the string to be valid.",
      complexity: "Time: O(N), Space: O(N)",
    },
    starterCode: `function isValid(s) {
  const stack = [];
  const bracketMap = {
    ')': '(',
    '}': '{',
    ']': '['
  };
  for (let i = 0; i < s.length; i++) {
    let char = s[i];
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      let top = stack.pop();
      if (top !== bracketMap[char]) {
        return false;
      }
    }
  }
  return stack.length === 0;
}`,
    presetInputs: [
      { name: "Valid Nested", params: ["{[()]()}"] },
      { name: "Invalid Order", params: ["([)]"] },
      { name: "Unbalanced Opening", params: ["{()"] }
    ]
  },
  {
    id: "reverse-linked-list",
    title: "Reverse Linked List",
    difficulty: "Easy",
    category: "Linked Lists",
    leetcodeUrl: "https://leetcode.com/problems/reverse-linked-list/",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    prerequisites: ["linked-lists", "pointers"],
    naiveApproach: {
      title: "Store Values in Array",
      description: "Traverse the linked list and store all node values in an array. Traverse again and overwrite node values in reverse order, or construct a new list.",
      complexity: "Time: O(N), Space: O(N)",
    },
    optimalApproach: {
      title: "Iterative In-Place Reversal",
      description: "Use three pointers: `prev` (initialized to null), `curr` (initialized to head), and `nextTemp` (stores the next node temporarily). Loop through the list: save the next node (`nextTemp = curr.next`), reverse the link (`curr.next = prev`), move `prev` to `curr`, and move `curr` to `nextTemp`. Finally, return `prev` as the new head.",
      complexity: "Time: O(N), Space: O(1)",
    },
    starterCode: `function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr !== null) {
    let nextTemp = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextTemp;
  }
  return prev;
}`,
    presetInputs: [
      { name: "Standard List", params: [{ val: 1, next: { val: 2, next: { val: 3, next: { val: 4, next: null } } } }] },
      { name: "Single Node", params: [{ val: 42, next: null }] }
    ]
  },
  {
    id: "max-subarray",
    title: "Maximum Subarray (Kadane's Algorithm)",
    difficulty: "Medium",
    category: "Dynamic Programming / Sliding Window",
    leetcodeUrl: "https://leetcode.com/problems/maximum-subarray/",
    description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
    prerequisites: ["arrays", "dynamic-programming"],
    naiveApproach: {
      title: "Brute Force Subarrays",
      description: "Compute the sum of every possible subarray using nested loops and track the maximum sum found.",
      complexity: "Time: O(N²), Space: O(1)",
    },
    optimalApproach: {
      title: "Kadane's Algorithm",
      description: "At each index `i`, decide whether to add the current element `nums[i]` to the existing subarray sum or start a new subarray beginning at `nums[i]`. Maintain a running `currentSum = max(nums[i], currentSum + nums[i])`, and update the overall `maxSum = max(maxSum, currentSum)`.",
      complexity: "Time: O(N), Space: O(1)",
    },
    starterCode: `function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}`,
    presetInputs: [
      { name: "Mixed positive/negative", params: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]] },
      { name: "All negative numbers", params: [[-5, -1, -8, -2, -3]] },
      { name: "Single Element", params: [[1]] }
    ]
  },
  {
    id: "container-water",
    title: "Container With Most Water",
    difficulty: "Medium",
    category: "Two Pointers",
    leetcodeUrl: "https://leetcode.com/problems/container-with-most-water/",
    description: "Given `n` non-negative integers `height` where each represents a point at coordinate `(i, height[i])`. `n` vertical lines are drawn. Find two lines that together with the x-axis form a container, such that the container contains the most water.",
    prerequisites: ["arrays", "two-pointers"],
    naiveApproach: {
      title: "Brute Force Pairs",
      description: "Check the water capacity of every possible pair of lines and return the maximum value.",
      complexity: "Time: O(N²), Space: O(1)",
    },
    optimalApproach: {
      title: "Two-Pointer Approach",
      description: "Start with two pointers: `left = 0` and `right = height.length - 1`. Calculate water area as `min(height[left], height[right]) * (right - left)`. To maximize the area, move the pointer that points to the shorter line inward (since moving the taller line inward cannot possibly increase the area limits). Repeat until the pointers meet.",
      complexity: "Time: O(N), Space: O(1)",
    },
    starterCode: `function maxArea(height) {
  let maxW = 0;
  let left = 0;
  let right = height.length - 1;
  while (left < right) {
    let currentHeight = Math.min(height[left], height[right]);
    let width = right - left;
    let currentArea = currentHeight * width;
    maxW = Math.max(maxW, currentArea);
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }
  return maxW;
}`,
    presetInputs: [
      { name: "Standard case", params: [[1, 8, 6, 2, 5, 4, 8, 3, 7]] },
      { name: "Flat profile", params: [[1, 1]] }
    ]
  }
];
