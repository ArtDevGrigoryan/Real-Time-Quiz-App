export type Role = "ADMIN" | "USER";

export type ActivityType = "QUIZ" | "PUZZLE_ASSEMBLY";

export type SessionStatus = "WAITING" | "ACTIVE" | "FINISHED";

export interface ISessionTemplate {
  id: string;
  name: string;
  createdAt: Date;
  activities?: IActivity[];
  sessions?: ISession[];
}

export interface IQuestion {
  id: string;
  activityId: string;
  text: string;
  correctIdx: number;
  timeLimit: number;
  order: number;
  activity?: IActivity;
  options?: IOption[];
  answers?: IParticipantAnswer[];
}

export interface IOption {
  id: string;
  questionId: string;
  text: string;
  question?: IQuestion;
}

export interface ISession {
  id: string;
  templateId: string;
  roomCode: string;
  maxParticipants: number;
  status: SessionStatus;
  createdAt: Date;
  currentActivityIndex: number;
  template?: ISessionTemplate;
  participants?: IParticipant[];
}

export interface IParticipant {
  id: string;
  name: string;
  sessionId: string;
  score: number;
  joinedAt: Date;
  session?: ISession;
  answers?: IParticipantAnswer[];
}

export interface IParticipantAnswer {
  id: string;
  participantId: string;
  questionId: string;
  selectedIdx: number;
  isCorrect: boolean;
  score: number;
  answeredAt: Date;
  participant?: IParticipant;
  question?: IQuestion;
}

export interface IActivity {
  id: string;
  templateId: string;
  type: ActivityType;
  title: string;
  description?: string | null;
  order: number;
  timerSeconds: number | null;
  fragmentsCount: number | null;
  pointsPerCorrect: number | null;
  createdAt: Date;
  template?: ISessionTemplate;
  questions?: IQuestion[];
}

export interface ILeaderBoard {
  participantId: string;
  name: string;
  score: number;
  rank: number;
}
