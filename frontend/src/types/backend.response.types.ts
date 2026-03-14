import type { ISession } from "./api.types";

export interface ICreateSessionResponse {
  sessionId: string;
  roomCode: string;
  session: ISession;
}
