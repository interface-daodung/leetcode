import type { WebSocket } from "ws";
import type { FastifyRequest } from "fastify";
import { generateGuide } from "@leetcode/ai";
import type { AIProblemInput } from "@leetcode/ai";

interface ClientMessage {
  type?: string;
  problem?: AIProblemInput;
}

/**
 * Xử lý kết nối WebSocket /ws/ai.
 * Client gửi { type: "guide", problem: {...} } → server dùng packages/ai sinh guide
 * (prompt/template nằm server-side, không lộ ra client) → trả { type: "guide", guide }.
 */
export function createAiController() {
  function handle(socket: WebSocket, _request: FastifyRequest): void {
    socket.on("message", async (raw: Buffer) => {
      let msg: ClientMessage;
      try {
        msg = JSON.parse(raw.toString()) as ClientMessage;
      } catch {
        socket.send(JSON.stringify({ type: "error", error: "invalid-json" }));
        return;
      }

      if (msg.type === "guide" && msg.problem) {
        try {
          const guide = await generateGuide(msg.problem);
          socket.send(JSON.stringify({ type: "guide", guide }));
        } catch (e) {
          socket.send(JSON.stringify({ type: "error", error: String(e) }));
        }
        return;
      }

      socket.send(JSON.stringify({ type: "error", error: "unknown-message" }));
    });
  }

  return { handle };
}
