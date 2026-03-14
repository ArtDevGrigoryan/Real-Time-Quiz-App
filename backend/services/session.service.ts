import randomCode from "../helpers/code-generator";
import db from "../helpers/db";
import { BadRequestException, NotFoundException } from "../helpers/errors";
import socketService from "./socket.service";
import {
  addSession,
  getSesssionState,
  removeSession,
  updateSession,
} from "./session.runtime.service";
import insertSessionTemplate from "../helpers/insert-template-db";
import participantAnswerService from "./participant.answer.service";
import participantService from "./participant.service";
import questionService from "./question.service";
import env from "../helpers/env";
import { IAnswer } from "../types/socket.types";

class SessionService {
  async getSessions() {
    const sessions = await db.client.session.findMany({
      include: {
        participants: true,
      },
    });
    return sessions;
  }
  async addSession(maxParticipants: number) {
    const newSession = await insertSessionTemplate(
      "Picsart Academy",
      randomCode(),
      maxParticipants,
    );
    const template = await db.client.sessionTemplate.findUnique({
      where: {
        id: newSession.templateId,
      },
      include: {
        activities: {
          include: {
            questions: true,
          },
        },
      },
    });
    if (!template) {
      throw new BadRequestException();
    }
    const currentActivity = template.activities[0];
    const currentQuestion = currentActivity.questions[0];

    addSession(newSession.id, {
      activityId: currentActivity.id,
      questionId: currentQuestion.id,
      activityIndex: 0,
      questionIndex: 0,
      startTime: Date.now(),
      duration: currentQuestion.timeLimit,
    });
    return {
      sessionId: newSession.id,
      roomCode: newSession.roomCode,
      session: newSession,
    };
  }
  async getSessionById(id: string) {
    const found = await db.client.session.findUnique({
      where: {
        id,
      },
      include: {
        participants: true,
      },
    });
    if (!found) {
      throw new NotFoundException();
    }
    return found;
  }
  async state(roomCode: string, participantId: string) {
    const session = await db.client.session.findUnique({
      where: {
        roomCode,
      },
    });
    if (!session) {
      throw new NotFoundException();
    }
    if (session.status == "FINISHED") {
      return await this.result(session.id);
    }
    const state = getSesssionState(session.id);
    if (!state) {
      return null;
    }
    const activity = await db.client.activity.findUnique({
      where: {
        id: state.activityId,
      },
    });
    if (activity?.type == "PUZZLE_ASSEMBLY") {
      const exist = await db.client.activityAnswer.findUnique({
        where: {
          participantId_activityId: { participantId, activityId: activity.id },
        },
        include: {
          participant: true,
        },
      });
      const alreadyAnswered = Boolean(exist);
      return {
        type: "PUZZLE",
        question: null,
        activity,
        alreadyAnswered,
        correctCount: exist?.correctCount,
        score: exist?.participant.score || 0,
        started: session.status == "ACTIVE",
      };
    }
    const question = await questionService.findById(state.questionId);
    const exist = await db.client.participantAnswer.findUnique({
      where: {
        participantId_questionId: {
          participantId,
          questionId: state.questionId,
        },
      },
      include: {
        participant: true,
      },
    });
    const alreadyAnswered = Boolean(exist);
    return {
      type: "QUIZ",
      question,
      activity,
      alreadyAnswered,
      selectedIndex: exist?.selectedIdx,
      score: exist?.participant.score || 0,
      started: session.status == "ACTIVE",
    };
  }
  async answer(sessionId: string, participantId: string, data: IAnswer) {
    const participant = await participantService.getParticipant(participantId);

    if (!participant || participant.sessionId != sessionId) {
      throw new NotFoundException("participant not found");
    }
    if (data.type === "QUIZ") {
      const question = await questionService.findById(data.questionId);
      if (!question) {
        throw new BadRequestException("question not found");
      }
      const currentState = getSesssionState(sessionId);
      if (!currentState) {
        throw new BadRequestException("Somethig went wrong");
      }
      const elapsed = (Date.now() - currentState.startTime) / 1000;
      const remaining = Math.max(0, question.timeLimit - elapsed);
      const isCorrect = data.selectedIdx == question.correctIdx;
      const score = isCorrect
        ? Math.floor(50 + 50 * (remaining / question.timeLimit))
        : 0;

      await participantAnswerService.answer(
        participantId,
        data.questionId,
        data.selectedIdx,
        score,
        isCorrect,
      );
      score &&
        (await participantService.updateScore(
          participant.id,
          participant.score + score,
        ));
      return { score };
    }
    const act = await db.client.activity.findUnique({
      where: {
        id: data.activityId,
      },
    });
    if (!act) {
      throw new BadRequestException("Activity not found");
    }
    const score =
      (act.pointsPerCorrect || env.DEFAULT_SCORE_PUZZLE_ASSEMBLY) *
      (data.correctCount >= (act.fragmentsCount || 4)
        ? act.fragmentsCount!
        : data.correctCount);

    const alreadyExist = await db.client.activityAnswer.findUnique({
      where: {
        participantId_activityId: {
          participantId,
          activityId: data.activityId,
        },
      },
    });
    if (alreadyExist) {
      throw new BadRequestException("Already answered");
    }
    const activityAnswer = await db.client.activityAnswer.create({
      data: {
        activityId: data.activityId,
        participantId,
        correctCount: data.correctCount,
        score,
      },
    });
    if (score == 0) {
      return { score, correctCount: 0 };
    }
    await participantService.updateScore(
      participantId,
      participant.score + score,
    );
    return { score, correctCount: activityAnswer.correctCount };
  }
  async start(sessionId: string) {
    const session = await db.client.session.findUniqueOrThrow({
      where: {
        id: sessionId,
      },
      include: {
        participants: true,
        template: {
          include: {
            activities: {
              include: {
                questions: {
                  include: {
                    options: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (session.status != "WAITING") {
      throw new BadRequestException();
    }
    await db.client.session.update({
      where: {
        id: session.id,
      },
      data: {
        currentActivityIndex: 0,
        status: "ACTIVE",
      },
    });
    const currentActivity =
      session.template.activities[session.currentActivityIndex];
    const currnetQuestion = currentActivity.questions[0];

    addSession(session.id, {
      activityId: currentActivity.id,
      questionId: currnetQuestion.id,
      activityIndex: 0,
      questionIndex: 0,
      startTime: Date.now(),
      duration: currnetQuestion.timeLimit,
    });
    await socketService.emitSessionStarted({
      session,
      question: currnetQuestion,
      activity: currentActivity,
      participants: session.participants,
    });
  }
  async next(sessionId: string) {
    const session = await db.client.session.findUnique({
      where: { id: sessionId },
      include: {
        template: {
          include: {
            activities: {
              include: {
                questions: {
                  include: {
                    options: true,
                  },
                },
              },
            },
          },
        },
        participants: true,
      },
    });
    if (!session) throw new NotFoundException("SESSION NOT FOUND");
    if (session.status !== "ACTIVE") throw new BadRequestException("FINISHED");
    const state = getSesssionState(session.id);
    if (!state) return this.start(sessionId);
    let questionIndex = (state?.questionIndex || 0) + 1;
    let activityIndex = state.activityIndex;

    const currentActivity = session.template.activities[activityIndex];

    if (questionIndex >= currentActivity.questions.length) {
      questionIndex = 0;
      activityIndex += 1;
      await db.client.session.update({
        where: {
          id: session.id,
        },
        data: {
          currentActivityIndex: activityIndex,
        },
      });
    }
    if (currentActivity.type == "QUIZ") {
      for (const participant of session.participants) {
        const answered = await db.client.participantAnswer.findUnique({
          where: {
            participantId_questionId: {
              participantId: participant.id,
              questionId: state.questionId,
            },
          },
        });

        if (!answered) {
          await participantAnswerService.answer(
            participant.id,
            state.questionId,
            -1,
            0,
            false,
          );
        }
        await socketService.emitAnswerResult({
          sessionId,
          participantId: participant.id,
          score: 0,
          isCorrect: false,
        });
      }
    }
    if (activityIndex >= session.template.activities.length) {
      await db.client.session.update({
        where: { id: session.id },
        data: { status: "FINISHED" },
      });
      await socketService.emitSessionEnded(session.id);
      removeSession(session.id);
      return this.result(session.id);
    }
    const nextActivity = session.template.activities[activityIndex];
    const nextQuestion = nextActivity.questions[questionIndex];
    const questionId = nextActivity.type == "QUIZ" ? nextQuestion.id : "";

    const duration =
      nextActivity.type == "QUIZ"
        ? nextQuestion.timeLimit
        : nextActivity.timerSeconds || env.DEFAULT_DURATION_PUZZLE_ASSEMBLY;

    updateSession(session.id, {
      activityId: nextActivity.id,
      questionId,
      activityIndex,
      questionIndex,
      startTime: Date.now(),
      duration,
    });
    if (activityIndex != state.activityIndex) {
      await socketService.emitActivityChanged(sessionId, nextActivity);
    }
    const participants = await db.client.participant.findMany({
      where: {
        sessionId,
      },
    });
    await socketService.emitQuestionChanged({
      sessionId,
      question: nextQuestion,
      participants,
    });
    await socketService.startTimer({
      sessionId,
      roomCode: session.roomCode,
      duration,
    });
  }
  async end(roomCode: string) {
    const session = await db.client.session.findUniqueOrThrow({
      where: {
        roomCode,
      },
    });
    if (session.status != "ACTIVE") {
      throw new BadRequestException();
    }
    await db.client.session.update({
      where: {
        id: session.id,
      },
      data: {
        status: "FINISHED",
      },
    });
    await socketService.emitSessionEnded(session.id);
    removeSession(session.id);
    return await this.result(session.id);
  }
  async result(sessionId: string) {
    const participants = await db.client.participant.findMany({
      where: {
        sessionId,
      },
      orderBy: {
        score: "desc",
      },
    });

    const leaderboard = participants.map((p, index) => ({
      participantId: p.id,
      name: p.name,
      score: p.score,
      rank: index + 1,
    }));
    await socketService.emitLeaderboard(sessionId, leaderboard);
    return null;
  }
  async removeParticipant(sessionId: string, participantId: string) {
    const result = await db.client.participant.deleteMany({
      where: {
        id: participantId,
        sessionId,
      },
    });
    if (result.count === 0) {
      throw new Error("Participant not found in this session");
    }
    const session = await db.client.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        participants: true,
      },
    });
    await socketService.emitParticipantDisjoined(sessionId, participantId);
    return session;
  }
  async lobbyUpdate(sessionId: string) {
    const session = await db.client.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        participants: true,
      },
    });
    if (!session) {
      throw new NotFoundException();
    }
    await socketService.emitLobbyUpdate(session);
  }
  async adminControlState(sessionId: string) {
    const currentState = getSesssionState(sessionId);

    if (!currentState) {
      return {
        participants: [],
        question: null,
        activity: null,
        participantAnswers: [],
      };
    }

    const activity = await db.client.activity.findUnique({
      where: { id: currentState.activityId },
    });

    if (!activity) {
      return {
        participants: [],
        question: null,
        activity: null,
        participantAnswers: [],
      };
    }

    const question =
      activity.type === "QUIZ"
        ? await questionService.findById(currentState.questionId)
        : null;

    const participantAnswers =
      activity.type === "QUIZ"
        ? await db.client.participantAnswer.findMany({
            select: { participantId: true },
            where: { questionId: question?.id },
          })
        : await db.client.activityAnswer.findMany({
            select: { participantId: true },
            where: { activityId: activity.id },
          });

    const participants = await db.client.participant.findMany({
      where: { sessionId },
    });

    const answeredSet = new Set(participantAnswers.map((a) => a.participantId));

    const ids = participants
      .filter((p) => answeredSet.has(p.id))
      .map((p) => p.id);

    return {
      participants,
      question,
      activity,
      participantAnswers: ids,
    };
  }
  async resultFromAdmin(sessionId: string) {
    const exist = await db.client.session.findUnique({
      where: {
        id: sessionId,
      },
    });
    if (!exist || exist.status != "FINISHED") {
      throw new BadRequestException("Session not found or not finished");
    }

    const participants = await db.client.participant.findMany({
      where: {
        sessionId,
      },
      orderBy: {
        score: "desc",
      },
    });
    const leaderboard = participants.map((p, index) => ({
      participantId: p.id,
      name: p.name,
      score: p.score,
      rank: index + 1,
    }));
    return leaderboard;
  }
  async delete(sessionId: string) {
    await db.client.session.delete({
      where: {
        id: sessionId,
      },
    });
    return true;
  }
}

export default new SessionService();
