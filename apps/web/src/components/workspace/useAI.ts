import { useCallback, useEffect, useRef, useState } from "react";
import type { AIGuide, AIProblemInput } from "@leetcode/ai";
import { API_BASE } from "../../lib/api.js";

/** WebSocket route phục vụ AI hướng dẫn giải (server giữ prompt, không lộ ra client). */
const WS_PATH = "/ws/ai";

interface GuideMessage {
  type: "guide";
  guide: AIGuide;
}

interface ErrorMessage {
  type: "error";
  error: string;
}

type AiMessage = GuideMessage | ErrorMessage;

function wsUrl(): string {
  const base = API_BASE.replace(/^http/, "ws");
  return `${base}${WS_PATH}`;
}

export function useAI() {
  const [guide, setGuide] = useState<AIGuide | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState <= WebSocket.OPEN) {
      return socketRef.current;
    }
    const ws = new WebSocket(wsUrl());
    socketRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as AiMessage;
        if (msg.type === "guide") {
          setGuide(msg.guide);
          setLoading(false);
          setError(null);
        } else if (msg.type === "error") {
          setError(msg.error);
          setLoading(false);
        }
      } catch {
        setError("Không đọc được phản hồi từ AI");
        setLoading(false);
      }
    };

    ws.onerror = () => {
      setError("Không kết nối được máy chủ AI (WebSocket)");
      setLoading(false);
    };

    ws.onclose = () => {
      socketRef.current = null;
    };

    return ws;
  }, []);

  // Ngắt kết nối khi unmount
  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  /** Yêu cầu AI sinh hướng dẫn cho bài toán — prompt xử lý ở server, client chỉ gửi dữ liệu bài toán. */
  const requestGuide = useCallback(
    (problem: AIProblemInput) => {
      const ws = connect();
      setError(null);
      setLoading(true);
      setGuide(null);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "guide", problem }));
      } else {
        // chờ connection open rồi gửi
        ws.onopen = () => {
          ws.send(JSON.stringify({ type: "guide", problem }));
        };
      }
    },
    [connect],
  );

  const clear = useCallback(() => {
    setGuide(null);
    setError(null);
    setLoading(false);
  }, []);

  return { guide, error, loading, requestGuide, clear };
}