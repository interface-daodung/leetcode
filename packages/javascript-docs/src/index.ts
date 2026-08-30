export interface DocEntry {
  topic: string;
  content: string;
  examples: string[];
}

export const jsDocs: DocEntry[] = [
  {
    topic: "Array Methods",
    content: "Common array methods for problem solving",
    examples: [
      "map, filter, reduce",
      "find, findIndex, includes",
      "slice, splice, concat",
    ],
  },
  {
    topic: "String Methods",
    content: "String manipulation for LeetCode",
    examples: [
      "split, join, replace",
      "charAt, charCodeAt",
      "substring, slice",
    ],
  },
];

export function getDoc(topic: string): DocEntry | undefined {
  return jsDocs.find((d) => d.topic.toLowerCase() === topic.toLowerCase());
}