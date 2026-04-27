import { Router } from "express";
import conversationsRouter from "./conversations";
import messagesRouter from "./messages";
import imagesRouter from "./images";
import modelsRouter from "./models";
import promptTemplatesRouter from "./promptTemplates";
import previewRouter from "./preview";

const router = Router();

router.use("/openai", conversationsRouter);
router.use("/openai", messagesRouter);
router.use("/openai", imagesRouter);
router.use("/openai", modelsRouter);
router.use("/openai", promptTemplatesRouter);
router.use("/openai", previewRouter);

export default router;
