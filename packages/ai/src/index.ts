export interface AIHint {
  type: "approach" | "optimization" | "edge-case";
  message: string;
}

export interface AIResponse {
  hints: AIHint[];
  explanation: string;
  complexity: {
    time: string;
    space: string;
  };
}

export async function getHint(problemId: number, userCode: string): Promise<AIResponse> {
  return {
    hints: [
      { type: "approach", message: "Consider using two pointers for this array problem" },
      { type: "optimization", message: "Can you reduce space complexity to O(1)?" },
    ],
    explanation: "This is a placeholder AI response. Integrate with your preferred LLM API.",
    complexity: { time: "O(n)", space: "O(1)" },
  };
}

export async function explainSolution(problemId: number, solution: string): Promise<string> {
  return `Explanation for problem ${problemId}: ${solution}`;
}