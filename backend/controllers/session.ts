import type { Request, Response } from "express";
import sessionService from "../services/session.service";
import { sendSuccess } from "../helpers/api-response";

class SessionController {
  async getSessions(req: Request, res: Response) {
    const sessions = await sessionService.getSessions();
    return sendSuccess(res, sessions);
  }
  async addSessions(req: Request, res: Response) {
    const { maxParticipants } = req.body;
    const data = await sessionService.addSession(Number(maxParticipants));
    return sendSuccess(res, data, "Created", 201);
  }
  async getSessionById(req: Request, res: Response) {
    const session = await sessionService.getSessionById(
      req.params.id as string,
    );
    return sendSuccess(res, session);
  }
  async state(req: Request, res: Response) {
    const data = await sessionService.state(
      req.params.roomCode as string,
      req.params.participantId as string,
    );
    return sendSuccess(res, data);
  }
  async adminControlState(req: Request, res: Response) {
    const data = await sessionService.adminControlState(
      req.params.id as string,
    );
    return sendSuccess(res, data);
  }
  async results(req: Request, res: Response) {
    const data = await sessionService.resultFromAdmin(req.params.id as string);
    return sendSuccess(res, data);
  }
  async delete(req: Request, res: Response) {
    await sessionService.delete(req.params.id as string);
    return sendSuccess(res, null);
  }
}

export default new SessionController();
