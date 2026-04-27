import { Router } from "express";
import { db, conversations, messages } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateOpenaiConversationBody,
  GetOpenaiConversationParams,
  DeleteOpenaiConversationParams,
  UpdateOpenaiConversationBody,
  UpdateOpenaiConversationParams,
} from "@workspace/api-zod";
import { ZodError } from "zod";
import { SUPPORTED_MODELS, isValidModel } from "../../constants/models";

function modelErrorResponse(model: unknown): string {
  return `Unsupported model "${model}". Supported models: ${SUPPORTED_MODELS.join(", ")}`;
}


const router = Router();

router.get("/conversations", async (_req, res) => {
  try {
    const result = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.createdAt));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

router.post("/conversations", async (req, res) => {
  const rawModel = req.body?.model;
  if (rawModel !== undefined && !isValidModel(rawModel)) {
    res.status(400).json({ error: modelErrorResponse(rawModel) });
    return;
  }
  try {
    const body = CreateOpenaiConversationBody.parse(req.body);
    const model = body.model ?? SUPPORTED_MODELS[0];
    const [created] = await db
      .insert(conversations)
      .values({
        title: body.title,
        model,
        systemPrompt: body.systemPrompt ?? null,
      })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    if (err instanceof ZodError) {
      const modelMsg = rawModel !== undefined ? modelErrorResponse(rawModel) : null;
      if (modelMsg) {
        res.status(400).json({ error: modelMsg });
        return;
      }
    }
    res.status(400).json({ error: "Invalid request body" });
  }
});

router.get("/conversations/:id", async (req, res) => {
  try {
    const { id } = GetOpenaiConversationParams.parse({ id: Number(req.params.id) });
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt);
    res.json({ ...conversation, messages: msgs });
  } catch (err) {
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

router.patch("/conversations/:id", async (req, res) => {
  const rawModel = req.body?.model;
  if (rawModel !== undefined && !isValidModel(rawModel)) {
    res.status(400).json({ error: modelErrorResponse(rawModel) });
    return;
  }
  try {
    const { id } = UpdateOpenaiConversationParams.parse({ id: Number(req.params.id) });
    const body = UpdateOpenaiConversationBody.parse(req.body);

    const updates: Partial<{ title: string; model: string; systemPrompt: string | null }> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.model !== undefined) updates.model = body.model;
    if ("systemPrompt" in body) updates.systemPrompt = body.systemPrompt?.trim() || null;

    const [updated] = await db
      .update(conversations)
      .set(updates)
      .where(eq(conversations.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    if (err instanceof ZodError) {
      const modelMsg = rawModel !== undefined ? modelErrorResponse(rawModel) : null;
      if (modelMsg) {
        res.status(400).json({ error: modelMsg });
        return;
      }
    }
    res.status(400).json({ error: "Invalid request body" });
  }
});

router.delete("/conversations/:id", async (req, res) => {
  try {
    const { id } = DeleteOpenaiConversationParams.parse({ id: Number(req.params.id) });
    const [deleted] = await db
      .delete(conversations)
      .where(eq(conversations.id, id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

export default router;
