import { engine } from "@leetcode/problem-engine";

engine.register({
  id: 1,
  title: "Two Sum",
  difficulty: "easy",
  tags: ["array", "hash-table"],
  description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  testCases: [
    { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
    { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
    { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
  ],
  solution: `function twoSum(nums, target) {
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
});

engine.register({
  id: 2,
  title: "Add Two Numbers",
  difficulty: "medium",
  tags: ["linked-list", "math", "recursion"],
  description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
  testCases: [
    { input: { l1: [2, 4, 3], l2: [5, 6, 4] }, expected: [7, 0, 8] },
    { input: { l1: [0], l2: [0] }, expected: [0] },
    { input: { l1: [9, 9, 9, 9, 9, 9, 9], l2: [9, 9, 9, 9] }, expected: [8, 9, 9, 9, 0, 0, 0, 1] },
  ],
});

engine.register({
  id: 3,
  title: "Longest Substring Without Repeating Characters",
  difficulty: "medium",
  tags: ["hash-table", "string", "sliding-window"],
  description: "Given a string s, find the length of the longest substring without repeating characters.",
  testCases: [
    { input: { s: "abcabcbb" }, expected: 3 },
    { input: { s: "bbbbb" }, expected: 1 },
    { input: { s: "pwwkew" }, expected: 3 },
  ],
});

console.log("Sample problems registered:", engine.getAll().length);