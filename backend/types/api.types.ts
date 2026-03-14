import type { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import type { ZodTypeAny } from "zod";

export interface ISocket extends Server {}
export interface IServer extends HttpServer {}

export type Signals = "SIGINT" | "SIGTERM" | "SIGHUP" | "SIGQUIT";

export interface ISchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export interface IOptions {
  defaults?: boolean;
}

export type ValidationSources = "body" | "query" | "params";

export interface ITokenPayload {
  id: string;
  role: "ADMIN" | "USER";
}

export interface ILeaderBoard {
  participantId: string;
  name: string;
  score: number;
  rank: number;
}
