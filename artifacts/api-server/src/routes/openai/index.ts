import { Router } from "express";
import conversationsRouter from "./conversations";
import messagesRouter from "./messages";
import imagesRouter from "./images";
import modelsRouter from "./models";

const router = Router();

router.use("/openai", conversationsRouter);
router.use("/openai", messagesRouter);
router.use("/openai", imagesRouter);
router.use("/openai", modelsRouter);

export default router;
