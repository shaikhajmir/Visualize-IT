export const concepts = {
  "arrays": {
    name: "Arrays",
    description: "An array is a linear data structure that stores elements in contiguous memory locations. Elements can be accessed directly using their index (0-indexed).",
    properties: [
      "Access: O(1) - immediate access via index.",
      "Search: O(N) - requires linear search unless sorted.",
      "Insertion/Deletion: O(N) - shifting elements is required if inserting/deleting in the middle."
    ],
    pitfalls: "Watch out for out-of-bounds index errors (e.g., trying to access index `arr.length` which does not exist)."
  },
  "two-pointers": {
    name: "Two Pointers",
    description: "A technique where two pointers (typically indices) are used to traverse a linear data structure, usually an array or string. They can move towards each other, move in the same direction at different speeds (slow/fast), or move independently.",
    properties: [
      "Commonly reduces O(N²) nested loops to O(N) linear time.",
      "Opposite direction: pointers start at both ends (`left = 0`, `right = length - 1`) and meet in the middle.",
      "Same direction (Fast & Slow): used for cycle detection in linked lists or sliding windows."
    ],
    pitfalls: "Ensure the terminating condition (`left < right` or `left <= right`) prevents pointers from crossing infinitely and creating infinite loops."
  },
  "binary-search": {
    name: "Binary Search",
    description: "An efficient search algorithm that works on sorted arrays. It continuously halves the search interval, comparing the target value to the middle element.",
    properties: [
      "Time Complexity: O(log N) instead of O(N) linear search.",
      "Precondition: The array must be sorted.",
      "Search Range: Halves at every step."
    ],
    pitfalls: "Make sure to update pointers correctly: `low = mid + 1` or `high = mid - 1`. Doing `low = mid` can lead to infinite loops."
  },
  "stacks": {
    name: "Stacks",
    description: "A Last-In, First-Out (LIFO) data structure. The element added last is the first one to be removed, similar to a stack of dinner plates.",
    properties: [
      "Push: O(1) - insert element at the top.",
      "Pop: O(1) - remove element from the top.",
      "Peek/Top: O(1) - view top element without removing it."
    ],
    pitfalls: "Ensure stack is not empty before popping (`stack.pop()`), which can return `undefined` and cause errors if properties are accessed."
  },
  "hash-maps": {
    name: "Hash Maps (Objects/Maps)",
    description: "A data structure that stores key-value pairs. It uses a hash function to map keys to bucket indices, providing extremely fast operations.",
    properties: [
      "Search/Lookup: O(1) average time.",
      "Insertion: O(1) average time.",
      "Keys must be unique."
    ],
    pitfalls: "Keys are mapped as strings in standard Javascript objects. Use the native ES6 `Map` object if you need keys of other types (numbers, objects, etc.)."
  },
  "linked-lists": {
    name: "Linked Lists",
    description: "A linear data structure where elements (nodes) are stored in non-contiguous memory locations. Each node contains a data value and a reference (pointer) to the next node in the list.",
    properties: [
      "Dynamic Size: easily grows and shrinks without reallocation.",
      "Insertion/Deletion at head: O(1) operations.",
      "Access/Search: O(N) - must traverse node-by-node from the head."
    ],
    pitfalls: "Always handle null references! Modifying `node.next` when `node` is `null` will throw a 'Cannot read properties of null' runtime exception."
  }
};
