import { Router } from "express";
import conversationsRouter from "./conversations";
import messagesRouter from "./messages";
import imagesRouter from "./images";

const router = Router();

router.use("/openai", conversationsRouter);
router.use("/openai", messagesRouter);
router.use("/openai", imagesRouter);

export default router;
