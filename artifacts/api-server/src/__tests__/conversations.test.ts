import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

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

vi.mock("@workspace/db", () => {
  const db = {
    select: () => mockSelect(),
    insert: () => mockInsert(),
    update: () => mockUpdate(),
    delete: () => mockDelete(),
  };
  return {
    db,
    conversations: { id: "id", title: "title", model: "model", systemPrompt: "systemPrompt", createdAt: "createdAt" },
    messages: { id: "id", conversationId: "conversationId", createdAt: "createdAt" },
  };
});

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    eq: vi.fn((_a, _b) => "eq-condition"),
    desc: vi.fn((_a) => "desc-order"),
    count: vi.fn((_a) => "count-agg"),
  };
});

const { default: app } = await import("../app.js");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/openai/conversations", () => {
  it("returns 200 with an array of conversations", async () => {
    const fakeConversations = [
      { id: 1, title: "Test Chat", model: "gpt-4o-mini", systemPrompt: null, createdAt: new Date().toISOString(), messageCount: 0 },
    ];
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          groupBy: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(fakeConversations),
          }),
        }),
      }),
    });

    const res = await request(app).get("/api/openai/conversations");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Test Chat");
  });

  it("returns 500 when the database throws", async () => {
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          groupBy: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockRejectedValue(new Error("db error")),
          }),
        }),
      }),
    });

    const res = await request(app).get("/api/openai/conversations");
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
  });
});

describe("POST /api/openai/conversations", () => {
  it("creates a conversation and returns 201", async () => {
    const created = { id: 1, title: "New Chat", model: "gpt-4o-mini", systemPrompt: null, createdAt: new Date().toISOString() };
    mockInsert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([created]),
      }),
    });

    const res = await request(app)
      .post("/api/openai/conversations")
      .send({ title: "New Chat" });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("New Chat");
  });

  it("returns 400 for an unsupported model", async () => {
    const res = await request(app)
      .post("/api/openai/conversations")
      .send({ title: "Test", model: "gpt-999-turbo" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

describe("GET /api/openai/conversations/:id", () => {
  it("returns 404 when conversation does not exist", async () => {
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    const res = await request(app).get("/api/openai/conversations/999");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});

describe("DELETE /api/openai/conversations/:id", () => {
  it("returns 404 when conversation does not exist", async () => {
    mockDelete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    });

    const res = await request(app).delete("/api/openai/conversations/999");
    expect(res.status).toBe(404);
  });

  it("returns 204 when conversation is deleted", async () => {
    const deleted = { id: 1, title: "Old Chat", model: "gpt-4o-mini", systemPrompt: null, createdAt: new Date().toISOString() };
    mockDelete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([deleted]),
      }),
    });

    const res = await request(app).delete("/api/openai/conversations/1");
    expect(res.status).toBe(204);
  });
});
