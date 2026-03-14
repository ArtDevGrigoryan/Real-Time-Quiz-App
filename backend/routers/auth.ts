import { Router } from "express";
import validate from "../middlewares/validate";
import { loginSchema } from "../schemas/auth.schema";
import auth from "../controllers/auth";

const router = Router();

router.post("/login", validate({ body: loginSchema }), auth.login);
router.post("/refresh", auth.refreshToken);

export default router;
