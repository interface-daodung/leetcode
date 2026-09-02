import { describe, it, expect, vi, afterEach } from "vitest";
import { EventEmitter } from "node:events";
import { createAiController } from "./controllers/ai.controller.js";

class MockSocket extends EventEmitter {
  messages: string[] = [];
  send(text: string) {
    this.messages.push(text);
  }
}

function parseMessage(controller: ReturnType<typeof createAiController>, socket: MockSocket, payload: unknown) {
  const handle = controller.handle;
  handle(socket as never, { headers: {} } as never);
  const arg = socket.listeners("message")[0];
  (arg as (raw: Buffer) => void)(Buffer.from(JSON.stringify(payload)));
}

describe("ai.controller — WebSocket /ws/ai", () => {
  afterEach(() => vi.restoreAllMocks());

  it("trả guide JSON khi gửi { type: 'guide', problem }", async () => {
    const controller = createAiController();
    const socket = new MockSocket();
    parseMessage(controller, socket, {
      type: "guide",
      problem: { id: 1, title: "Two Sum", slug: "two-sum", difficulty: "easy", tags: ["array"] },
    });
    // allow async handler to finish
    await Promise.resolve();
    await Promise.resolve();
    expect(socket.messages).toHaveLength(1);
    const msg = JSON.parse(socket.messages[0]);
    expect(msg.type).toBe("guide");
    expect(msg.guide.problemId).toBe(1);
    expect(msg.guide.sections.length).toBeGreaterThan(0);
  });

  it("phản hồi error khi JSON không hợp lệ", () => {
    const controller = createAiController();
    const socket = new MockSocket();
    const handle = controller.handle;
    handle(socket as never, { headers: {} } as never);
    const listener = socket.listeners("message")[0];
    (listener as (raw: Buffer) => void)(Buffer.from("not-json{{{"));
    expect(socket.messages).toHaveLength(1);
    expect(JSON.parse(socket.messages[0]).type).toBe("error");
  });

  it("phản hồi error khi type không hỗ trợ", async () => {
    const controller = createAiController();
    const socket = new MockSocket();
    parseMessage(controller, socket, { type: "nope" });
    await Promise.resolve();
    expect(JSON.parse(socket.messages[0]).type).toBe("error");
  });
});