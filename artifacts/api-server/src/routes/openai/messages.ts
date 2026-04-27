import { Router } from "express";
import { db, conversations, messages } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  SendOpenaiMessageBody,
  SendOpenaiMessageParams,
  ListOpenaiMessagesParams,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { isValidModel, SUPPORTED_MODELS } from "../../constants/models";

const router = Router();

router.get("/conversations/:id/messages", async (req, res) => {
  try {
    const { id } = ListOpenaiMessagesParams.parse({ id: Number(req.params.id) });
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt);
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: "Failed to list messages" });
  }
});

router.post("/conversations/:id/messages", async (req, res) => {
  try {
    const { id } = SendOpenaiMessageParams.parse({ id: Number(req.params.id) });
    const body = SendOpenaiMessageBody.parse(req.body);

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));

    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    if (!isValidModel(conversation.model)) {
      res.status(400).json({
        error: `Unsupported model "${conversation.model}". Supported models: ${SUPPORTED_MODELS.join(", ")}`,
      });
      return;
    }

    await db.insert(messages).values({
      conversationId: id,
      role: "user",
      content: body.content,
    });

    const existingMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt);

    const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [];
    if (conversation.systemPrompt) {
      chatMessages.push({ role: "system", content: conversation.systemPrompt });
    }
    for (const msg of existingMessages) {
      chatMessages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";
    const stream = await openai.chat.completions.create({
      model: conversation.model,
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    await db.insert(messages).values({
      conversationId: id,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
