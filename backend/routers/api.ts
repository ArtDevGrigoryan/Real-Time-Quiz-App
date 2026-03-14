import { Router } from "express";
import authRouter from "./auth";
import sessionRouter from "./session";
import participantsRouter from "./participants";

const router = Router();

router.use("/auth", authRouter);
router.use("/sessions", sessionRouter);
router.use("/participants", participantsRouter);

export default router;
