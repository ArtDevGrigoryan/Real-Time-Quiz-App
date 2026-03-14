import { IJoinDto } from "../schemas/participants.schema";
import db from "../helpers/db";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../helpers/errors";

class ParticipantsService {
  async join(data: IJoinDto) {
    const session = await db.client.session.findUnique({
      where: {
        roomCode: data.roomCode,
      },
      include: {
        participants: true,
      },
    });

    if (!session) {
      throw new NotFoundException("Session not found");
    }
    const participants = session.participants;
    if (participants.length >= session.maxParticipants) {
      throw new ConflictException("Room is full");
    }
    participants.forEach((p) => {
      if (p.name == data.name) {
        throw new BadRequestException("this name already exist");
      }
    });
    const participant = await db.client.participant.create({
      data: {
        name: data.name,
        sessionId: session.id,
      },
    });
    session.participants = [...session.participants, participant];
    return { participant, session };
  }
  async findById(id: string) {
    return await db.client.participant.findUnique({
      where: {
        id,
      },
    });
  }
}

export default new ParticipantsService();
