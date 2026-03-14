import type { Request, Response } from "express";
import participantsService from "../services/participants.service";
import { sendSuccess } from "../helpers/api-response";
import socketService from "../services/socket.service";

class ParticipantsController {
  async join(req: Request, res: Response) {
    const { participant, session } = await participantsService.join(req.body);

    await socketService.emitParticipantJoined(session);
    return sendSuccess(res, {
      participantId: participant.id,
      sessionId: session.id,
    });
  }
}

export default new ParticipantsController();
