import { Router } from "express";
import { GenerateOpenaiImageBody } from "@workspace/api-zod";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";

const router = Router();

router.post("/generate-image", async (req, res) => {
  try {
    const body = GenerateOpenaiImageBody.parse(req.body);
    const size = (body.size as "1024x1024" | "1536x1024" | "1024x1536") ?? "1024x1024";
    const buffer = await generateImageBuffer(body.prompt, size);
    res.json({ b64_json: buffer.toString("base64") });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate image" });
  }
});

export default router;
