import type { Activity, Participant, Question, Session } from "@prisma/client";
import { ILeaderBoard, ISocket } from "../types/api.types";
import sessionService from "./session.service";
import { SessionWithParticipants } from "../types/prisma.types";
import {
  IAnswerResult,
  IChangeQuestion,
  ISessionStarted,
  ITimerStart,
} from "../types/socket.types";

interface TimerState {
  sessionId: string;
  timeRemaining: number;
  interval?: NodeJS.Timeout;
  roomCode?: string;
}

class SocketService {
  private io: ISocket | null = null;
  private timers: Record<string, TimerState> = {};

  async initIO() {
    if (!this.io) {
      const mod = await import("../socket");
      this.io = mod.getIO();
    }
    return this.io;
  }
  async emitLobbyUpdate(session: Session) {
    const io = await this.initIO();
    io.to(session.id).emit("lobby_update", session);
  }
  async emitParticipantJoined(session: SessionWithParticipants) {
    const io = await this.initIO();
    io.to(session.id).emit("participant_joined", session.participants);
    this.emitLobbyUpdate(session);
  }

  async emitSessionStarted(data: ISessionStarted) {
    const io = await this.initIO();
    io.to(data.session.id).emit("session_started", data);

    await this.startTimer({
      sessionId: data.session.id,
      roomCode: data.session.roomCode,
      duration: data.question.timeLimit,
    });
  }
  async emitQuestionChanged(data: IChangeQuestion) {
    const io = await this.initIO();
    io.to(data.sessionId).emit("question_changed", data);
    await this.updateTimer(data.sessionId, data.question?.timeLimit || 20);
  }
  async emitActivityChanged(sessionId: string, activity: Activity) {
    const io = await this.initIO();
    io.to(sessionId).emit("activity_changed", activity);
  }
  async emitSessionEnded(sessionId: string) {
    const io = await this.initIO();
    io.to(sessionId).emit("session_ended");
    await this.stopTimer(sessionId);
  }
  async emitLeaderboard(sessionId: string, leaderboard: ILeaderBoard[]) {
    const io = await this.initIO();
    io.to(sessionId).emit("leaderboard_result", leaderboard);
  }

  async emitAnswerResult(data: IAnswerResult) {
    const io = await this.initIO();
    io.to(data.sessionId).emit("answer_result", data);
  }

  async emitParticipantDisjoined(sessionId: string, participantId: string) {
    const io = await this.initIO();
    io.to(sessionId).emit("disjoined", participantId);
  }
  async startTimer(data: ITimerStart) {
    if (this.timers[data.sessionId]?.interval) {
      clearInterval(this.timers[data.sessionId]?.interval as NodeJS.Timeout);
    }
    const io = await this.initIO();
    const state: TimerState = {
      sessionId: data.sessionId,
      roomCode: data.roomCode,
      timeRemaining: data.duration,
    };
    this.timers[data.sessionId] = state;
    io.to(data.sessionId).emit("timer_update", {
      timeRemaining: data.duration,
    });

    state.interval = setInterval(async () => {
      state.timeRemaining -= 1;

      if (state.timeRemaining <= 0) {
        clearInterval(state.interval as NodeJS.Timeout);
        delete this.timers[data.sessionId];
        io.to(data.sessionId).emit("timer_end");
        await sessionService.next(state.sessionId);
      } else {
        io.to(data.sessionId).emit("timer_update", {
          timeRemaining: state.timeRemaining,
        });
      }
    }, 1000);
  }

  async updateTimer(sessionId: string, duration: number) {
    const io = await this.initIO();
    const state = this.timers[sessionId];
    if (!state) {
      return await this.startTimer({ sessionId, duration });
    }
    const interval = state.interval;
    if (interval) {
      clearInterval(interval);
    }
    state.timeRemaining = duration;
    state.interval = setInterval(async () => {
      state.timeRemaining -= 1;
      if (state.timeRemaining <= 0) {
        clearInterval(state.interval as NodeJS.Timeout);
        delete this.timers[sessionId];
        io.to(sessionId).emit("timer_end");
        await sessionService.next(state.sessionId);
      } else {
        io.to(state.sessionId).emit("timer_update", {
          timeRemaining: state.timeRemaining,
        });
      }
    }, 1000);
  }

  async stopTimer(sessionId: string) {
    const io = await this.initIO();
    const state = this.timers[sessionId];
    if (state?.interval) {
      clearInterval(state.interval as NodeJS.Timeout);
      io.to(sessionId).emit("timer_end");
    }
  }

  async emitCustom(event: string, sessionId: string, data: any) {
    const io = await this.initIO();
    io.to(sessionId).emit(event, data);
  }
}

export default new SocketService();
