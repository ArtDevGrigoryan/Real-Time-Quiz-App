import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/admin/LoginPage";
import SessionsList from "./pages/admin/SessionsList";
import SessionLobby from "./pages/admin/SessionLobby";
import HostControlPanel from "./pages/admin/HostControlPanel";

import JoinPage from "./pages/participant/JoinPage";
import WaitingRoom from "./pages/participant/WaitingRoom";
import SessionResult from "./pages/admin/SessionResult";

export const router = createBrowserRouter([
  {
    path: "/admin/login",
    element: <LoginPage />,
  },
  {
    path: "/admin/sessions",
    element: <SessionsList />,
  },
  {
    path: "/admin/session/:sessionId",
    element: <SessionLobby />,
  },
  {
    path: "/admin/control/:sessionId",
    element: <HostControlPanel />,
  },
  {
    path: "admin/session/:sessionId/results",
    element: <SessionResult />,
  },

  {
    path: "/",
    element: <JoinPage />,
  },
  {
    path: "/waiting/:roomCode",
    element: <WaitingRoom />,
  },
]);
