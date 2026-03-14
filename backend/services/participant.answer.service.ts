import db from "../helpers/db";
import { BadRequestException } from "../helpers/errors";

class ParticipantAnswerService {
  async answer(
    participantId: string,
    questionId: string,
    selectedIdx: number,
    score: number = 0,
    isCorrect: boolean = false,
  ) {
    const alreadyAnswered = await db.client.participantAnswer.findUnique({
      where: {
        participantId_questionId: { participantId, questionId },
      },
    });
    if (alreadyAnswered) {
      throw new BadRequestException("Already answered");
    }
    return await db.client.participantAnswer.create({
      data: {
        participantId,
        questionId,
        score,
        isCorrect,
        selectedIdx,
      },
    });
  }
}
export default new ParticipantAnswerService();
