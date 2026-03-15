import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import LoginPage from "./pages/admin/LoginPage";
import SessionsList from "./pages/admin/SessionsList";
import SessionLobby from "./pages/admin/SessionLobby";
import HostControlPanel from "./pages/admin/HostControlPanel";
import SessionResult from "./pages/admin/SessionResult";

import JoinPage from "./pages/participant/JoinPage";
import WaitingRoom from "./pages/participant/WaitingRoom";

function AdminLayout() {
  return <Outlet />;
}

function ParticipantLayout() {
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "sessions",
        element: <SessionsList />,
      },
      {
        path: "session/:sessionId",
        element: <SessionLobby />,
      },
      {
        path: "control/:sessionId",
        element: <HostControlPanel />,
      },
      {
        path: "session/:sessionId/results",
        element: <SessionResult />,
      },

      // եթե ուրիշ admin route լինի
      {
        path: "*",
        element: <Navigate to="/admin/sessions" replace />,
      },
    ],
  },

  // ---------------- PARTICIPANT ----------------
  {
    path: "/",
    element: <ParticipantLayout />,
    children: [
      {
        index: true,
        element: <JoinPage />,
      },
      {
        path: "waiting/:roomCode",
        element: <WaitingRoom />,
      },

      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
