import type { IActivity, IParticipant, IQuestion, ISession } from "./app.types";

export interface IResponse<T> {
  success: boolean;
  message: string;
  payload: T;
}

export interface IAnswerDto {
  questionId: number;
  selectedIdx: number;
}

export interface ISessionStarted {
  session: ISession;
  question: IQuestion;
  activity: IActivity;
  participants: IParticipant[];
}

export interface IChangeQuestion {
  sessionId: string;
  question: IQuestion | null;
  participants: IParticipant[];
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

export interface ITimerEvent {
  timeRemaining: number;
}

export interface IErrorEvent {
  message: string;
}

export type ISessionState =
  | {
      type: "QUIZ";
      question: IQuestion;
      activity: IActivity;
      alreadyAnswered: boolean;
      selectedIndex: number;
      score: number;
      started: boolean;
    }
  | {
      type: "PUZZLE";
      question: null;
      activity: IActivity;
      alreadyAnswered: boolean;
      correctCount: number;
      score: number;
      started: boolean;
    };

export interface ICurrentState {
  activity: IActivity;
  participants: IParticipant[];
  question: IQuestion | null;
  participantAnswers: string[];
}
