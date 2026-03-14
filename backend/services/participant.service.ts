import db from "../helpers/db";

class ParticipantService {
  async updateScore(participantId: string, score: number) {
    return await db.client.participant.update({
      where: {
        id: participantId,
      },
      data: {
        score,
      },
    });
  }
  async getParticipant(id: string) {
    return await db.client.participant.findUnique({
      where: {
        id,
      },
    });
  }
}

export default new ParticipantService();
