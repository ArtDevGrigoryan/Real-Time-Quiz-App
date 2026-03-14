import { initSocket } from "./socket";
import express from "express";
import http from "http";

const app = express();
const server: IServer = http.createServer(app);
const io = initSocket(server);

import db from "./helpers/db";
import env from "./helpers/env";
import type { IServer } from "./types/api.types";
import processEventHandler from "./helpers/utilities/process-event-handler";
import cookieParser from "cookie-parser";
import api from "./routers/api";
import { notFoundHandler } from "./middlewares/not-found";
import globalErrorHandler from "./middlewares/global-error-handler";
import cors from "cors";
import socketHandlerService from "./services/socket.handler.service";

(async () => {
  await db.connect();
  await socketHandlerService.connection();
})();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", api);

server.listen(env.PORT, () =>
  console.log(`Server running on port http://localhost:${env.PORT}`),
);

app.use(notFoundHandler);
app.use(globalErrorHandler);

processEventHandler(server, io);
