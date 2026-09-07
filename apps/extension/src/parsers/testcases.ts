/**
 * Parser: test cases từ nhiều nguồn (hidden cm-content → visible console → __NEXT_DATA__ → description <pre>).
 */
import type { TestCase } from "../shared.js";
import { findDescriptionContainer } from "./description.js";
import { extractTemplate } from "./template.js";

/**
 * Parse JSON an toàn cho test case line (vd "[1,2]" → array, "1" → 1, "[1]" → array)
 */
function parseJsonLine(line: string): unknown {
  const trimmed = line.trim();
  if (!trimmed) return trimmed;
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

/**
 * Trích xuất testCases từ console DOM.
 * Ưu tiên: hidden cm-content → visible console → __NEXT_DATA__ → description <pre>.
 */
export function extractTestCases(doc: Document): TestCase[] | undefined {
  // Thử 1: Hidden editor với tất cả cases
  const hiddenSelectors = [
    "div.mt-0.h-0.overflow-hidden.opacity-0",
    "div.opacity-0.h-0",
    "div.h-0.overflow-hidden.opacity-0",
    'div[class*="opacity-0"][class*="h-0"]',
    "div.overflow-hidden.opacity-0",
  ];
  let hidden: Element | null = null;
  for (const sel of hiddenSelectors) {
    const el = doc.querySelector(sel);
    if (el && el.querySelector(".cm-content")) {
      hidden = el;
      break;
    }
  }
  // Fallback: tìm mọi .cm-content nằm trong container ẩn
  if (!hidden) {
    const allHiddenCm = Array.from(doc.querySelectorAll<HTMLElement>(".cm-content")).filter((el) => {
      const style = (el as HTMLElement).style;
      const parent = el.closest("div");
      if (!parent) return false;
      const cls = parent.className;
      return cls.includes("opacity-0") || cls.includes("h-0") || style.display === "none";
    });
    if (allHiddenCm.length > 0) {
      hidden = allHiddenCm[0].closest("div") as Element | null;
    }
  }

  if (hidden) {
    const cmContents = Array.from(hidden.querySelectorAll(".cm-content"));
    let inputLines: string[] = [];
    let expectedLines: string[] = [];
    const headers = Array.from(hidden.querySelectorAll("div.text-xs.font-medium"));
    const headerTexts = headers.map((h) => (h.textContent ?? "").trim().toLowerCase());
    if (headerTexts.includes("input") && headerTexts.includes("expected")) {
      const inputIdx = headerTexts.indexOf("input");
      const expectedIdx = headerTexts.indexOf("expected");
      if (cmContents[inputIdx]) {
        inputLines = Array.from(cmContents[inputIdx].querySelectorAll(".cm-line")).map((el) => (el.textContent ?? "").trim());
      }
      if (cmContents[expectedIdx]) {
        expectedLines = Array.from(cmContents[expectedIdx].querySelectorAll(".cm-line")).map((el) => (el.textContent ?? "").trim());
      }
    } else if (cmContents.length >= 3) {
      inputLines = Array.from(cmContents[0].querySelectorAll(".cm-line")).map((el) => (el.textContent ?? "").trim());
      expectedLines = Array.from(cmContents[2].querySelectorAll(".cm-line")).map((el) => (el.textContent ?? "").trim());
    } else if (cmContents.length === 2) {
      inputLines = Array.from(cmContents[0].querySelectorAll(".cm-line")).map((el) => (el.textContent ?? "").trim());
      expectedLines = Array.from(cmContents[1].querySelectorAll(".cm-line")).map((el) => (el.textContent ?? "").trim());
    } else if (cmContents.length === 1) {
      inputLines = Array.from(cmContents[0].querySelectorAll(".cm-line")).map((el) => (el.textContent ?? "").trim());
      expectedLines = Array.from(cmContents[0].querySelectorAll(".cm-line")).map((el) => (el.textContent ?? "").trim());
    }
    inputLines = inputLines.filter((l) => l.length > 0);
    expectedLines = expectedLines.filter((l) => l.length > 0);
    if (inputLines.length > 0 && expectedLines.length > 0) {
      const parsed = buildTestCasesFromLines(inputLines, expectedLines, doc);
      if (parsed && parsed.length > 0) return parsed;
    }
  }

  // Thử 2: Visible console per-case (flex-1 overflow-y-auto)
  const consoleContainer = doc.querySelector("div.flex-1.overflow-y-auto");
  if (consoleContainer) {
    const inputLabels = Array.from(consoleContainer.querySelectorAll("div.mx-3.mb-2.text-xs")).map((el) => (el.textContent ?? "").trim().replace(/\s*=\s*$/, ""));
    let expectedEl: Element | null =
      consoleContainer.querySelector("span.text-green-s") ??
      consoleContainer.querySelector("span[class*='text-green']") ??
      consoleContainer.querySelector("div.group.relative.rounded-lg.bg-fill-4")?.parentElement?.querySelector("span.text-green-s") ??
      null;
    if (!expectedEl) {
      const expectedHeader = Array.from(consoleContainer.querySelectorAll("div.text-xs.font-medium")).find(
        (el) => (el.textContent ?? "").trim().toLowerCase() === "expected",
      );
      if (expectedHeader) {
        const maybe = expectedHeader.parentElement?.parentElement?.querySelector("div.font-menlo, span.text-green-s");
        if (maybe) expectedEl = maybe;
      }
    }
    if (!expectedEl) {
      const candidates = Array.from(consoleContainer.querySelectorAll("span, div.font-menlo"));
      expectedEl = candidates.find((el) => {
        const t = (el.textContent ?? "").trim();
        return /^\s*\[.*\]\s*$/.test(t) || t === "[]" || /^\s*\d+\s*$/.test(t);
      }) ?? null;
      const green = candidates.find((el) => el.className.includes("text-green") || el.className.includes("green"));
      if (green) expectedEl = green;
    }
    if (inputLabels.length > 0) {
      const inputValues: unknown[] = [];
      const labelElements = Array.from(consoleContainer.querySelectorAll("div.mx-3.mb-2.text-xs"));
      for (const labelEl of labelElements) {
        const container = labelEl.parentElement ?? labelEl.closest("div.group");
        const valueEl = container?.querySelector("div.font-menlo") ?? (labelEl.nextElementSibling as Element | null);
        if (valueEl) {
          const raw = (valueEl.textContent ?? "").trim();
          if (raw) inputValues.push(parseJsonLine(raw));
        } else {
          const next = labelEl.nextElementSibling;
          if (next) {
            const raw = (next.textContent ?? "").trim();
            if (raw) inputValues.push(parseJsonLine(raw));
          }
        }
      }
      const expectedRaw = (expectedEl?.textContent ?? "").trim();
      const expected = expectedRaw ? parseJsonLine(expectedRaw) : undefined;
      if (inputValues.length > 0 && expected !== undefined) {
        let input: unknown;
        if (inputLabels.length === inputValues.length && inputLabels.every(Boolean)) {
          input = Object.fromEntries(inputLabels.map((k, i) => [k, inputValues[i]]));
        } else if (inputValues.length === 1) {
          input = inputValues[0];
        } else {
          input = inputValues;
        }
        return [{ input, expected }];
      }
    }
  }

  // Thử 3: Tìm trong __NEXT_DATA__
  try {
    const nextDataEl = doc.getElementById("__NEXT_DATA__") ?? doc.querySelector('script#__NEXT_DATA__');
    if (nextDataEl?.textContent) {
      const data = JSON.parse(nextDataEl.textContent);
      const tcs = findTestCasesInJson(data);
      if (tcs && tcs.length > 0) return tcs;
    }
    for (const s of Array.from(doc.querySelectorAll('script[type="application/json"]'))) {
      try {
        const d = JSON.parse(s.textContent ?? "");
        const tcs2 = findTestCasesInJson(d);
        if (tcs2 && tcs2.length > 0) return tcs2;
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }

  // Thử 4: Parse từ description <pre> (Example Input/Output) — fallback cuối cùng
  const descCases = extractTestCasesFromDescription(doc);
  if (descCases && descCases.length > 0) return descCases;

  return undefined;
}

function findTestCasesInJson(data: unknown): TestCase[] | undefined {
  const stack: unknown[] = [data];
  const seen = new WeakSet<object>();
  let exampleTestcasesStr: string | null = null;
  let exampleInputs: unknown[] | null = null;

  while (stack.length) {
    const cur = stack.pop();
    if (!cur || typeof cur !== "object") continue;
    if (seen.has(cur)) continue;
    seen.add(cur);
    if (Array.isArray(cur)) {
      if (cur.length > 0 && typeof cur[0] === "object" && cur[0] && "input" in (cur[0] as Record<string, unknown>) && "expected" in (cur[0] as Record<string, unknown>)) {
        return cur as TestCase[];
      }
      for (const v of cur) stack.push(v);
      continue;
    }
    const obj = cur as Record<string, unknown>;
    if (Array.isArray(obj["testCases"]) && (obj["testCases"] as unknown[]).length > 0) {
      return obj["testCases"] as TestCase[];
    }
    if (typeof obj["exampleTestcases"] === "string" && (obj["exampleTestcases"] as string).trim()) {
      exampleTestcasesStr = obj["exampleTestcases"] as string;
    }
    if (typeof obj["exampleTestcaseList"] === "string" && (obj["exampleTestcaseList"] as string).trim()) {
      exampleTestcasesStr = obj["exampleTestcaseList"] as string;
    }
    if (typeof obj["jsonExampleTestcases"] === "string" && (obj["jsonExampleTestcases"] as string).trim()) {
      exampleTestcasesStr = obj["jsonExampleTestcases"] as string;
    }
    if (exampleTestcasesStr) {
      const parsed = parseExampleTestcasesString(exampleTestcasesStr, obj);
      if (parsed && parsed.length > 0) exampleInputs = parsed;
    }
    for (const v of Object.values(obj)) {
      if (v && typeof v === "object") stack.push(v);
    }
  }
  if (exampleInputs && exampleInputs.length > 0) {
    return exampleInputs.map((inp) => ({ input: inp, expected: null }));
  }
  if (exampleTestcasesStr) {
    const fallback = parseExampleTestcasesString(exampleTestcasesStr, null);
    if (fallback && fallback.length > 0) return fallback.map((inp) => ({ input: inp, expected: null }));
  }
  return undefined;
}

function parseExampleTestcasesString(str: string, _ctx: Record<string, unknown> | null): unknown[] | undefined {
  const trimmed = str.trim();
  if (!trimmed) return undefined;
  const lines = trimmed
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return undefined;
  const parsed: unknown[] = [];
  for (const line of lines) {
    try {
      parsed.push(JSON.parse(line));
    } catch {
      const m = line.match(/=\s*(.+)$/);
      if (m) {
        try {
          parsed.push(JSON.parse(m[1].trim()));
          continue;
        } catch {
          // ignore
        }
      }
      parsed.push(line);
    }
  }
  return parsed.length > 0 ? parsed : undefined;
}

/**
 * Fallback: trích xuất testCases từ description <pre> blocks (Example Input/Output).
 */
function extractTestCasesFromDescription(doc: Document): TestCase[] | undefined {
  const container = findDescriptionContainer(doc);
  if (!container) return undefined;
  const pres = Array.from(container.querySelectorAll("pre"));
  const cases: TestCase[] = [];
  for (const pre of pres) {
    const text = (pre.textContent ?? "").trim();
    if (!text) continue;
    const inputMatch = text.match(/Input:\s*([\s\S]*?)\s*Output:/i);
    const outputMatch = text.match(/Output:\s*([\s\S]*)/i);
    if (!inputMatch || !outputMatch) continue;
    const inputRaw = inputMatch[1].trim();
    const outputRaw = outputMatch[1].trim().split("\n")[0].trim();
    let inputVal: unknown = inputRaw;
    const eqIdx = inputRaw.indexOf("=");
    const jsonPart = eqIdx >= 0 ? inputRaw.slice(eqIdx + 1).trim() : inputRaw;
    try {
      inputVal = JSON.parse(jsonPart);
    } catch {
      inputVal = jsonPart;
    }
    let expectedVal: unknown = outputRaw;
    try {
      expectedVal = JSON.parse(outputRaw);
    } catch {
      expectedVal = outputRaw;
    }
    let paramName = "grid";
    if (eqIdx >= 0) {
      const beforeEq = inputRaw.slice(0, eqIdx).trim();
      if (/^[a-zA-Z_]\w*$/.test(beforeEq)) paramName = beforeEq;
    } else {
      const tpl = extractTemplate(doc);
      if (tpl) {
        const m = tpl.match(/function\s+\w*\s*\(([^)]*)\)/) ?? tpl.match(/var\s+\w+\s*=\s*function\s*\(([^)]*)\)/);
        if (m?.[1]) {
          const firstParam = m[1].split(",")[0]?.trim().split(/\s*=\s*/)[0]?.trim();
          if (firstParam) paramName = firstParam;
        }
      }
    }
    const inputObj = { [paramName]: inputVal };
    cases.push({ input: inputObj, expected: expectedVal });
  }
  return cases.length > 0 ? cases : undefined;
}

function buildTestCasesFromLines(inputLines: string[], expectedLines: string[], doc: Document): TestCase[] | undefined {
  if (expectedLines.length === 0) return undefined;
  const totalCases = expectedLines.length;
  const perCaseInputCount = inputLines.length / totalCases;
  const perCase = Number.isInteger(perCaseInputCount) && perCaseInputCount > 0 ? perCaseInputCount : 1;

  let paramNames: string[] = [];
  const labelEls = Array.from(doc.querySelectorAll("div.mx-3.mb-2.text-xs"));
  const labels = labelEls.map((el) => (el.textContent ?? "").trim().replace(/\s*=\s*$/, "").trim()).filter(Boolean);
  if (labels.length === perCase) {
    paramNames = labels;
  } else {
    const template = extractTemplate(doc);
    if (template) {
      const m = template.match(/function\s+\w*\s*\(([^)]*)\)/) ?? template.match(/var\s+\w+\s*=\s*function\s*\(([^)]*)\)/) ?? template.match(/\(([^)]*)\)\s*=>/);
      if (m?.[1]) {
        const params = m[1]
          .split(",")
          .map((p) => p.trim().split(/\s*=\s*/)[0].trim())
          .filter(Boolean);
        if (params.length === perCase) paramNames = params;
        else if (params.length > 0) paramNames = params.slice(0, perCase);
      }
      if (paramNames.length === 0) {
        const paramMatches = Array.from(template.matchAll(/@param\s+\{[^}]+\}\s+(\w+)/g)).map((mm) => mm[1]);
        if (paramMatches.length === perCase) paramNames = paramMatches;
      }
    }
  }

  const cases: TestCase[] = [];
  for (let i = 0; i < totalCases; i++) {
    const inputChunk = inputLines.slice(i * perCase, (i + 1) * perCase);
    const expectedRaw = expectedLines[i];
    const expected = parseJsonLine(expectedRaw);

    let input: unknown;
    const parsedInputs = inputChunk.map(parseJsonLine);
    if (paramNames.length === parsedInputs.length && paramNames.length > 0) {
      input = Object.fromEntries(paramNames.map((k, idx) => [k, parsedInputs[idx]]));
    } else if (parsedInputs.length === 1) {
      input = parsedInputs[0];
    } else if (parsedInputs.length > 1) {
      input = parsedInputs;
    } else {
      input = parsedInputs[0];
    }

    cases.push({ input, expected });
  }

  return cases.length > 0 ? cases : undefined;
}
