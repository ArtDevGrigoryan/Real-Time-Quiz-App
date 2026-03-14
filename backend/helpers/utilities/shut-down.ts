import { IServer, ISocket } from "../../types/api.types";

export default async function shutDown(server: IServer, socket: ISocket) {
  await server.close();
  console.log("Server closed");
  await socket.close();
  console.log("Socket closed");
  process.exit(0);
}
