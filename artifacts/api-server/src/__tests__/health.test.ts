import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("@workspace/db", () => ({
  db: {},
  conversations: {},
  messages: {},
}));

vi.mock("@workspace/integrations-openai-ai-server", () => ({
  openai: {},
  generateImageBuffer: vi.fn(),
  editImages: vi.fn(),
  batchProcess: vi.fn(),
  batchProcessWithSSE: vi.fn(),
  isRateLimitError: vi.fn(),
}));

vi.mock("@workspace/integrations-openai-ai-server/image", () => ({
  generateImageBuffer: vi.fn(),
  editImages: vi.fn(),
}));

const { default: app } = await import("../app.js");

describe("GET /api/healthz", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/api/healthz");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
