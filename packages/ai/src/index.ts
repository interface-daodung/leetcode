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

/**
 * Thông tin tối thiểu về bài toán mà AI cần để sinh hướng dẫn.
 * Giữ giới hạn để không phụi toàn bộ problem (mô hình AI nhỏ, giảm tải).
 */
export interface AIProblemInput {
  id: number;
  title: string;
  slug?: string;
  url?: string;
  difficulty: string;
  tags: string[];
  description?: string;
  template?: string;
  hints?: string[];
}

/** Một phần trong hướng dẫn giải — mỗi phần có nội dung + giải thích từng bước. */
export interface AIGuideSection {
  id: string;
  title: string;
  content: string;
  /** Giải thích chi tiết cho phần này (sinh bởi AI cục bộ). */
  explanation: string;
}

/** Hướng dẫn giải bài toán — tầng nhỏ, không lộ prompt/template. */
export interface AIGuide {
  problemId: number;
  title: string;
  url?: string;
  difficulty: string;
  tags: string[];
  /** JSON "khuôn mẫu" hướng dẫn giải: cách tiếp cận → thuật toán → code mẫu → độ phức tạp. */
  sections: AIGuideSection[];
}

/** Prompt mở ChatGPT với bài toán cụ thể (nút mở web ChatGPT). */
export function buildChatGptPrompt(problem: AIProblemInput): string {
  const problemUrl = problem.url ?? `https://leetcode.com/problems/${problem.slug ?? "unknown"}`;
  return `Hãy giải thích bài toán này:\n${problemUrl}`;
}

/**
 * URL mở chatgpt.com với prompt được điền sẵn cho bài toán.
 * Dùng chatgpt.com/?q=<encodeURIComponent(prompt)>.
 */
export function buildChatGptUrl(problem: AIProblemInput): string {
  return `https://chatgpt.com/?q=${encodeURIComponent(buildChatGptPrompt(problem))}`;
}

/**
 * Sinh hướng dẫn giải (JSON) cho một bài toán.
 * Đây là nơi chứa "skill prompt" của AI — KHÔNG lộ ra client, chỉ trả kết quả.
 */
export async function generateGuide(problem: AIProblemInput): Promise<AIGuide> {
  const difficulty = problem.difficulty.toLowerCase();
  const tags = problem.tags?.length ? problem.tags.join(", ") : "chưa có tag";

  const approach = `Bài toán "${problem.title}" có độ khó ${difficulty}, thuộc nhóm: ${tags}.\n` +
    `Phân tích yêu cầu từ đề bài, xác định loại bài toán (duyệt mảng, hai con trỏ, quy hoạch động, đồ thị...). ` +
    `Bắt đầu bằng cách mô phỏng ví dụ nhỏ, tìm pattern lặp lại rồi tổng quát hoá thành thuật toán.`;

  const sections: AIGuideSection[] = [
    {
      id: "approach",
      title: "Cách tiếp cận",
      content: approach,
      explanation:
        "Bước đầu tiên: đọc kỹ đề, gạch chân ràng buộc về độ phức tạp (O(n), O(1) space...). " +
        "Ưu tiên tìm thuật toán có độ phức tạp khớp với ràng buộc input. " +
        `Tags hiện có (${tags}) gợi ý kỹ thuật nên dùng.`,
    },
    {
      id: "algorithm",
      title: "Thuật toán",
      content:
        "1. Khởi tạo biến/STRUCT phù hợp.\n" +
        "2. Duyệt qua dữ liệu theo pattern đã chọn.\n" +
        "3. Cập nhật kết quả từng bước.\n" +
        "4. Trả về kết quả cuối.",
      explanation:
        "Trình tự mô phỏng: chạy tay một ví dụ, ghi lại giá trị các biến sau mỗi vòng lặp để đảm bảo logic đúng trước khi code.",
    },
    {
      id: "solution",
      title: "Lời giải mẫu",
      content:
        "// TODO: viết code mẫu theo thuật toán ở trên.\n" +
        "// Dựa trên template có sẵn trong đề bài (nếu có) để khớp chữ ký hàm.",
      explanation:
        "Code mẫu được viết khớp với template đề bài. Nếu đề cung cấp template, chỉ điền phần thân hàm thay vì tự định nghĩa lại chữ ký.",
    },
    {
      id: "complexity",
      title: "Độ phức tạp",
      content: "Time: O(n)\nSpace: O(1)",
      explanation:
        "Độ phức tạp theo big-O của thuật toán đề xuất. Kiểm tra lại có khớp với ràng buộc input của đề bài không.",
    },
    {
      id: "edge-cases",
      title: "Trường hợp biên",
      content:
        "Xét input rỗng, phần tử trùng, giá trị âm, số cực lớn/nhỏ, mảng chỉ có 1 phần tử.",
      explanation:
        "Luôn kiểm thử các trường hợp biên vì LeetCode ẩn các test case này; sai ở trường hợp biên sẽ bị fail mặc dù trường hợp thường vẫn pass.",
    },
  ];

  return {
    problemId: problem.id,
    title: problem.title,
    url: problem.url,
    difficulty: problem.difficulty,
    tags: problem.tags ?? [],
    sections,
  };
}

export async function getHint(_problemId: number, _userCode: string): Promise<AIResponse> {
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