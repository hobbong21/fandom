import { Router } from "express";
import { SUPPORTED_MODELS } from "../../constants/models";

const router = Router();

router.get("/models", (_req, res) => {
  res.json({ models: SUPPORTED_MODELS });
});

export default router;
