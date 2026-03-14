import { Activity, Session, Participant, Question } from "@prisma/client";

export interface ISessionStarted {
  session: Session;
  question: Question;
  activity: Activity;
  participants: Participant[];
}

export interface IChangeQuestion {
  sessionId: string;
  question: Question | null;
  participants: Participant[];
}

export interface IAnswerResult {
  sessionId: string;
  participantId: string;
  score: number;
  isCorrect?: boolean;
  correctCount?: number;
}

export interface ITimerStart {
  sessionId: string;
  roomCode?: string;
  duration: number;
}

export interface IJoinSession {
  participantId: string;
  sessionId: string;
}

export interface INext {
  sessionId: string;
}

export interface IStart {
  sessionId: string;
}

export interface ITimerPause {
  sessionId: string;
}

export interface ITimerReset {
  sessionId: string;
}

export interface IAdminJoined {
  sessionId: string;
}

export interface IRemoveParticipant {
  adminId: string;
  participantId: string;
  sessionId: string;
}

export type IAnswer =
  | {
      type: "QUIZ";
      questionId: string;
      selectedIdx: number;
    }
  | {
      type: "PUZZLE";
      activityId: string;
      correctCount: number;
    };
