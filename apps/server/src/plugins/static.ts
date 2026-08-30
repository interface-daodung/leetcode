import fastifyStatic from "@fastify/static";
import type { FastifyInstance } from "fastify";
import { ASSETS_ROOT } from "../config.js";

// Serve ảnh đã tải về: packages/database/data/assets -> /assets/*
export async function registerStatic(app: FastifyInstance): Promise<void> {
  await app.register(fastifyStatic, {
    root: ASSETS_ROOT,
    prefix: "/assets/",
    wildcard: false,
    decorateReply: false,
  });
}
