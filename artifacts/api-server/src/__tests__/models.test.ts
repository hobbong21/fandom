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

describe("GET /api/openai/models", () => {
  it("returns 200 with a list of supported models", async () => {
    const res = await request(app).get("/api/openai/models");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("models");
    expect(Array.isArray(res.body.models)).toBe(true);
    expect(res.body.models.length).toBeGreaterThan(0);
  });

  it("includes gpt-4o-mini in the model list", async () => {
    const res = await request(app).get("/api/openai/models");
    expect(res.body.models).toContain("gpt-4o-mini");
  });

  it("includes gpt-4o in the model list", async () => {
    const res = await request(app).get("/api/openai/models");
    expect(res.body.models).toContain("gpt-4o");
  });
});
