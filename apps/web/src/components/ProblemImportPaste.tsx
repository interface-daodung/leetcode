import { useState } from "react";
import { parseProblemClipJson, sanitizeDescriptionHtml } from "../lib/problemClip.js";
import type { ProblemClip } from "@leetcode/shared";

// Host lưu ở root .env (VITE_API_URL), đồng bộ với server và extension
const API_BASE: string = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL ?? "http://localhost:3000";

export function ProblemImportPaste({ onImported }: { onImported?: (clip: ProblemClip) => void }) {
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [clip, setClip] = useState<ProblemClip | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleParse = (value: string) => {
    setRaw(value);
    setSaveMessage(null);
    if (!value.trim()) {
      setClip(null);
      setError(null);
      return;
    }
    const result = parseProblemClipJson(value);
    if (result.error) {
      setError(result.error);
      setClip(null);
    } else {
      setError(null);
      setClip(result.clip);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        setError("Clipboard rỗng");
        return;
      }
      handleParse(text);
    } catch (e) {
      setError(`Không đọc được clipboard: ${String(e)}`);
    }
  };

  const handleSave = async () => {
    if (!clip) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/problems/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clip),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; problem?: unknown };
      if (!res.ok) {
        setSaveMessage(`Lỗi ${res.status}: ${data.error ?? "Không lưu được"}`);
        return;
      }
      setSaveMessage(`Đã lưu: ${clip.id}. ${clip.title} (${clip.difficulty})`);
      onImported?.(clip);
    } catch (e) {
      setSaveMessage(`Lỗi mạng: ${String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", background: "#fafafa" }}>
      <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>Nhập đề bài từ LeetCode Clipper</h2>
      <p style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", color: "#6b7280" }}>
        Mở <code>leetcode.com/problems/...</code> → bấm widget <strong>LC</strong> để copy JSON → dán vào đây → Lưu.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <button
          type="button"
          onClick={handlePasteFromClipboard}
          style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", cursor: "pointer" }}
        >
          Paste từ clipboard
        </button>
        <button
          type="button"
          onClick={() => handleParse("")}
          style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", cursor: "pointer" }}
        >
          Xoá
        </button>
      </div>

      <textarea
        value={raw}
        onChange={(e) => handleParse(e.target.value)}
        onPaste={(e) => {
          // cho phép paste trực tiếp, parse sau khi paste xong
          const pasted = e.clipboardData.getData("text");
          if (pasted) setTimeout(() => handleParse(pasted), 0);
        }}
        placeholder='Dán JSON từ extension vào đây... ví dụ: { "id": 5, "title": "...", "difficulty": "medium", "description": "<p>...</p>" }'
        style={{ width: "100%", minHeight: "120px", fontFamily: "monospace", fontSize: "12px", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
      />

      {error && (
        <div style={{ marginTop: "0.5rem", color: "#dc2626", fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>{error}</div>
      )}

      {clip && (
        <div style={{ marginTop: "1rem", borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>
              {clip.id}. {clip.title}
            </strong>{" "}
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: "999px",
                fontSize: "0.75rem",
                background: clip.difficulty === "easy" ? "#dcfce7" : clip.difficulty === "medium" ? "#fef9c3" : "#fee2e2",
                color: "#374151",
                marginLeft: "0.5rem",
              }}
            >
              {clip.difficulty}
            </span>
            {clip.slug && <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", color: "#6b7280" }}>/{clip.slug}</span>}
          </div>

          <div
            style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "0.75rem", maxHeight: "260px", overflow: "auto", fontSize: "0.9rem", lineHeight: 1.5 }}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: sanitizeDescriptionHtml(clip.description) }}
          />

          {clip.url && (
            <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#6b7280" }}>
              URL: <a href={clip.url} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>{clip.url}</a>
            </div>
          )}

          {clip.template && (
            <div style={{ marginTop: "0.5rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}>Template:</div>
              <pre style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "0.5rem", fontSize: "12px", whiteSpace: "pre-wrap", maxHeight: "160px", overflow: "auto" }}>{clip.template}</pre>
            </div>
          )}

          {clip.hints && clip.hints.length > 0 && (
            <div style={{ marginTop: "0.5rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}>Hints ({clip.hints.length}):</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {clip.hints.map((h, i) => (
                  <div
                    key={i}
                    style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", padding: "0.5rem", fontSize: "0.85rem" }}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: sanitizeDescriptionHtml(h) }}
                  />
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{ padding: "0.5rem 1rem", cursor: saving ? "not-allowed" : "pointer", background: "#111827", color: "#fff", border: "none", borderRadius: "6px" }}
            >
              {saving ? "Đang lưu..." : "Lưu vào DB"}
            </button>
            {saveMessage && <span style={{ fontSize: "0.85rem", color: saveMessage.startsWith("Đã lưu") ? "#16a34a" : "#dc2626" }}>{saveMessage}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
