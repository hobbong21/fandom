import { Router } from "express";
import { z, ZodError } from "zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { isValidModel, SUPPORTED_MODELS } from "../../constants/models";

const router = Router();

const PreviewBody = z.object({
  systemPrompt: z.string(),
  model: z.string(),
  message: z.string().optional().default("Introduce yourself in one sentence."),
});

router.post("/preview", async (req, res) => {
  let headersSent = false;
  try {
    let body: z.infer<typeof PreviewBody>;
    try {
      body = PreviewBody.parse(req.body);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ error: "Invalid request body", details: err.errors });
        return;
      }
      throw err;
    }

    if (!isValidModel(body.model)) {
      res.status(400).json({
        error: `Unsupported model "${body.model}". Supported models: ${SUPPORTED_MODELS.join(", ")}`,
      });
      return;
    }

    const chatMessages: { role: "system" | "user"; content: string }[] = [];
    if (body.systemPrompt.trim()) {
      chatMessages.push({ role: "system", content: body.systemPrompt.trim() });
    }
    chatMessages.push({ role: "user", content: body.message });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    headersSent = true;

    const stream = await openai.chat.completions.create({
      model: body.model,
      max_completion_tokens: 512,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    if (headersSent) {
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: "Failed to run preview" });
    }
  }
});

export default router;
