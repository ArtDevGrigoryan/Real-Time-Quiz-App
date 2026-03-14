import { IServer, ISocket, Signals } from "../../types/api.types";
import shutDown from "./shut-down";
export default async function processEventHandler(
  server: IServer,
  socket: ISocket,
) {
  const processEvent: Signals[] = ["SIGINT", "SIGTERM", "SIGHUP", "SIGQUIT"];
  processEvent.forEach((event) => {
    process.on(event, shutDown.bind(null, server, socket));
  });
}
