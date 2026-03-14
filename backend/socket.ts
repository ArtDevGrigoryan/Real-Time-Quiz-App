import { Server } from "socket.io";
import http from "http";
import { ISocket } from "./types/api.types";

let io: ISocket;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: { origin: "http://localhost:5173", credentials: true },
    // transports: ["websocket"],
  });
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
