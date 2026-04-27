import { Router } from "express";
import { db, promptTemplates } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateOpenaiPromptTemplateBody,
  DeleteOpenaiPromptTemplateParams,
  UpdateOpenaiPromptTemplateBody,
  UpdateOpenaiPromptTemplateParams,
} from "@workspace/api-zod";
import { ZodError } from "zod";

const router = Router();

router.get("/prompt-templates", async (_req, res) => {
  try {
    const result = await db
      .select()
      .from(promptTemplates)
      .orderBy(desc(promptTemplates.createdAt));
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to list prompt templates" });
  }
});

router.post("/prompt-templates", async (req, res) => {
  let body;
  try {
    body = CreateOpenaiPromptTemplateBody.parse(req.body);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  try {
    const [created] = await db
      .insert(promptTemplates)
      .values({ name: body.name, content: body.content })
      .returning();
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: "Failed to create prompt template" });
  }
});

router.patch("/prompt-templates/:id", async (req, res) => {
  let id: number;
  try {
    ({ id } = UpdateOpenaiPromptTemplateParams.parse({ id: Number(req.params.id) }));
  } catch {
    res.status(400).json({ error: "Invalid template id" });
    return;
  }
  let body;
  try {
    body = UpdateOpenaiPromptTemplateBody.parse(req.body);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  if (body.name === undefined && body.content === undefined) {
    res.status(400).json({ error: "At least one of name or content must be provided" });
    return;
  }
  try {
    const [updated] = await db
      .update(promptTemplates)
      .set({ ...(body.name !== undefined && { name: body.name }), ...(body.content !== undefined && { content: body.content }) })
      .where(eq(promptTemplates.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Prompt template not found" });
      return;
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update prompt template" });
  }
});

router.delete("/prompt-templates/:id", async (req, res) => {
  let id: number;
  try {
    ({ id } = DeleteOpenaiPromptTemplateParams.parse({ id: Number(req.params.id) }));
  } catch {
    res.status(400).json({ error: "Invalid template id" });
    return;
  }
  try {
    const [deleted] = await db
      .delete(promptTemplates)
      .where(eq(promptTemplates.id, id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Prompt template not found" });
      return;
    }
    res.status(204).end();
  } catch {
    res.status(500).json({ error: "Failed to delete prompt template" });
  }
});

export default router;
