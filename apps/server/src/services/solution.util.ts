/**
 * Lọc bỏ comment (// và /* *\/) trong code JavaScript — giữ nguyên chuỗi ký tự.
 * Dùng state machine để không phá chuỗi '//', "/*", template literal.
 */
export function stripComments(code: string): string {
  let out = "";
  let i = 0;
  const n = code.length;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLine = false;
  let inBlock = false;

  while (i < n) {
    const c = code[i];
    const next = code[i + 1];

    if (inLine) {
      if (c === "\n") {
        inLine = false;
        out += c;
      }
      i++;
      continue;
    }

    if (inBlock) {
      if (c === "*" && next === "/") {
        inBlock = false;
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    if (inSingle) {
      out += c;
      if (c === "\\" && next !== undefined) {
        out += next;
        i += 2;
        continue;
      }
      if (c === "'") inSingle = false;
      i++;
      continue;
    }

    if (inDouble) {
      out += c;
      if (c === "\\" && next !== undefined) {
        out += next;
        i += 2;
        continue;
      }
      if (c === '"') inDouble = false;
      i++;
      continue;
    }

    if (inTemplate) {
      out += c;
      if (c === "\\" && next !== undefined) {
        out += next;
        i += 2;
        continue;
      }
      if (c === "`") inTemplate = false;
      i++;
      continue;
    }

    if (c === "/" && next === "/") {
      inLine = true;
      i += 2;
      continue;
    }
    if (c === "/" && next === "*") {
      inBlock = true;
      i += 2;
      continue;
    }
    if (c === "'") {
      inSingle = true;
      out += c;
      i++;
      continue;
    }
    if (c === '"') {
      inDouble = true;
      out += c;
      i++;
      continue;
    }
    if (c === "`") {
      inTemplate = true;
      out += c;
      i++;
      continue;
    }

    out += c;
    i++;
  }

  return out;
}

/**
 * Trích tên hàm giải đầu tiên trong code đã lọc comment.
 * Hỗ trợ: `function name(...)`, `var/let/const name = function`, `name = (args) =>`.
 */
export function extractFunctionName(cleaned: string): string | null {
  const re =
    /(?:function\s+([A-Za-z_$][\w$]*)\s*\(|(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?function|(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(?[^=]*?=>)/;
  const m = cleaned.match(re);
  if (!m) return null;
  return m[1] ?? m[2] ?? m[3] ?? null;
}

/**
 * Trích hàm giải từ code người dùng: lọc comment → tìm hàm duy nhất → trả về function.
 * Ném lỗi nếu không tìm thấy hàm hợp lệ.
 */
export function extractSolutionFunction(code: string): (...args: unknown[]) => unknown {
  const cleaned = stripComments(code).trim();
  if (!cleaned) throw new Error("Code rỗng sau khi lọc comment");

  const name = extractFunctionName(cleaned);
  if (name) {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(cleaned + `; return ${name};`)();
    if (typeof fn === "function") return fn as (...args: unknown[]) => unknown;
  }

  // Fallback: khối function không tên đứng riêng
  const naked = cleaned.match(/(?:async\s+)?function\s*\([\s\S]*\)\s*\{[\s\S]*\}/);
  if (naked) {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    return new Function("return (" + naked[0] + ")")() as (...args: unknown[]) => unknown;
  }

  throw new Error("Không tìm thấy hàm giải trong code");
}

/** Bọc hàm giải để chạy test case: input array/object → truyền nhiều tham số. */
export function wrapSolution(fn: (...args: unknown[]) => unknown): (input: unknown) => unknown {
  return (input: unknown) => {
    if (Array.isArray(input)) return fn(...input);
    if (typeof input === "object" && input !== null) return fn(...Object.values(input));
    return fn(input);
  };
}