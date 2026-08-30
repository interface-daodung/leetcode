CREATE TABLE "problems" (
	"id" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"difficulty" text NOT NULL,
	"tags" text DEFAULT '[]',
	"description" text NOT NULL,
	"solution" text,
	"test_cases" text DEFAULT '[]',
	"created_at" text DEFAULT (datetime('now'))
);
--> statement-breakpoint
INSERT INTO [problems] ([id], [title], [difficulty], [tags], [description], [test_cases], [solution]) VALUES
(1, 'Two Sum', 'easy', '["array","hash-table"]', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', '[{"input":{"nums":[2,7,11,15],"target":9},"expected":[0,1]},{"input":{"nums":[3,2,4],"target":6},"expected":[1,2]},{"input":{"nums":[3,3],"target":6},"expected":[0,1]}]', 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}'),
(2, 'Add Two Numbers', 'medium', '["linked-list","math","recursion"]', 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.', '[{"input":{"l1":[2,4,3],"l2":[5,6,4]},"expected":[7,0,8]},{"input":{"l1":[0],"l2":[0]},"expected":[0]},{"input":{"l1":[9,9,9,9,9,9,9],"l2":[9,9,9,9]},"expected":[8,9,9,9,0,0,0,1]}]', NULL),
(3, 'Longest Substring Without Repeating Characters', 'medium', '["hash-table","string","sliding-window"]', 'Given a string s, find the length of the longest substring without repeating characters.', '[{"input":{"s":"abcabcbb"},"expected":3},{"input":{"s":"bbbbb"},"expected":1},{"input":{"s":"pwwkew"},"expected":3}]', NULL);