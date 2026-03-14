import { Router } from "express";
import participants from "../controllers/participants";
import validate from "../middlewares/validate";
import { joinSchema } from "../schemas/participants.schema";

const router = Router();

router.post("/join", validate({ body: joinSchema }), participants.join);

export default router;
