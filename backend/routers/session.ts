import { Router } from "express";
import isAuth from "../middlewares/is-auth";
import session from "../controllers/session";
import isAdmin from "../middlewares/is-admin";
import validate from "../middlewares/validate";
import { addSessionSchema } from "../schemas/session.schema";

const router = Router();

router.get("/", isAuth, session.getSessions);
router.post(
  "/",
  isAuth,
  isAdmin,
  validate({ body: addSessionSchema }),
  session.addSessions,
);
router.delete("/:id", isAuth, isAdmin, session.delete);
router.get("/:id/admin", isAuth, isAdmin, session.adminControlState);
router.get("/:id/results", isAuth, isAdmin, session.results);
router.get("/:id", isAuth, session.getSessionById);
router.get("/:roomCode/state/:participantId", session.state);
export default router;
