import { ISocket } from "../types/api.types";
import {
  IAdminJoined,
  IAnswer,
  IJoinSession,
  INext,
  IRemoveParticipant,
  IStart,
} from "../types/socket.types";
import sessionService from "./session.service";
import socketService from "./socket.service";

class SocketHandlerService {
  private io: ISocket | null = null;

  async initIO() {
    if (!this.io) {
      const mod = await import("../socket");
      this.io = mod.getIO();
    }
    return this.io;
  }
  async connection() {
    const io = await this.initIO();

    io.on("connection", async (socket) => {
      socket.on("connect", () => console.log("on Connected:", socket.id));
      socket.on("connect_error", (err) => console.error("on Connect error:"));
      socket.on("disconnect", (reason) => console.log("on Disconnected:"));

      socket.on(
        "join_session",
        async ({ participantId, sessionId }: IJoinSession) => {
          try {
            if (socket.data.participantId == participantId) {
              socket.emit("socket_error", "Already joined");
            }
            socket.join(sessionId);
            socket.data.sessionId = sessionId;
            socket.data.participantId = participantId;
            await sessionService.lobbyUpdate(sessionId);
          } catch (err: any) {
            socket.emit("socket_error", err.message || "Something went wrong");
          }
        },
      );

      socket.on("answer", async (data: IAnswer) => {
        try {
          const result = await sessionService.answer(
            socket.data.sessionId,
            socket.data.participantId,
            data,
          );
          await socketService.emitAnswerResult({
            sessionId: socket.data.sessionId,
            participantId: socket.data.participantId,
            score: result.score,
            isCorrect: Boolean(data.type == "QUIZ" ? result.score > 0 : false),
            correctCount: (data.type == "PUZZLE" && result.correctCount) || 0,
          });
        } catch (err: any) {
          socket.emit("socket_error", err.message || "Something went wrong");
        }
      });
      socket.on("disconnect", () => {
        const participantId = socket.data?.participantId ?? "unknown";
      });
      socket.on("admin_joined", (data: IAdminJoined) => {
        socket.join(data.sessionId);
      });
      socket.on("remove_participant", async (data: IRemoveParticipant) => {
        try {
          const session = await sessionService.removeParticipant(
            data.sessionId,
            data.participantId,
          );
          await socketService.emitParticipantDisjoined(
            data.sessionId,
            data.participantId,
          );
          await socketService.emitLobbyUpdate(session!);
        } catch (err: any) {
          socket.emit("socket_error", err.message || "Something went wrong");
        }
      });
      socket.on("start", async (data: IStart) => {
        try {
          await sessionService.start(data.sessionId);
        } catch (err: any) {
          socket.emit("socket_error", err.message || "Something went wrong");
        }
      });
      socket.on("next", async (data: INext) => {
        try {
          await sessionService.next(data.sessionId);
        } catch (err: any) {
          if (err.message == "FINISHED") {
            socketService.emitSessionEnded(data.sessionId);
          }
          socket.emit("socket_error", err.message || "Something went wrong");
        }
      });
      socket.on("end", async (data: INext) => {
        try {
          await sessionService.end(data.sessionId);
        } catch (err: any) {
          socket.emit("socket_error", err.message || "Something went wrong");
        }
      });
    });
  }
}

export default new SocketHandlerService();
