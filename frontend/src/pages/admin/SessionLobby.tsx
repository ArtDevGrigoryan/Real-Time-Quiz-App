import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import Axios from "../../axios.config";
import type { IResponse } from "../../types/api.types";
import { useSocket } from "../../hooks/useSocket";
import Toast from "../../components/messagePopup";
import type { IParticipant, ISession } from "../../types/app.types";

export default function SessionLobby() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<ISession | null>(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<IParticipant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { socket, connected } = useSocket();

  const fetchSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await Axios.get<IResponse<ISession>>(
        `/sessions/${sessionId}`,
      );
      setSession(data.payload);
    } catch (err: any) {
      setError(err.message || "Failed to load session");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    socket?.emit("admin_joined", { sessionId });
    socket?.on("participant_joined", (data: IParticipant[]) =>
      setParticipants(data),
    );
    socket?.on("lobby_update", (data: ISession) => {
      setSession(data);
      if (data.participants) setParticipants(data.participants);
    });
    return () => {
      socket?.off("participant_joined");
      socket?.off("lobby_update");
    };
  }, [sessionId, socket]);

  const handleRemoveParticipant = (participantId: string) => {
    try {
      const adminId = localStorage.getItem("participantId");
      socket?.emit("remove_participant", { adminId, participantId, sessionId });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  const handleStartSession = () => {
    if (!session) return;
    if ((participants?.length || 0) < 2) {
      alert("At least 2 participants required to start the session.");
      return;
    }
    navigate(`/admin/control/${sessionId}`);
  };

  if (loading)
    return (
      <p className="p-6 text-gray-500 dark:text-gray-400">Loading session...</p>
    );
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!session)
    return (
      <p className="p-6 text-gray-500 dark:text-gray-400">Session not found.</p>
    );

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      {error && <Toast message={error} type="error" onClose={() => {}} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Session Lobby
        </h1>
        <span
          className={`font-semibold ${connected ? "text-green-500" : "text-red-500"}`}
        >
          SOCKET: {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {/* Room Code & QR */}
      <Card className="flex flex-col items-center space-y-4 bg-neutral-100 dark:bg-neutral-800 p-6 rounded-3xl shadow-2xl">
        <p className="font-medium text-gray-900 dark:text-white">
          Room Code: <span className="text-blue-500">{session.roomCode}</span>
        </p>
        <QRCodeCanvas value={session.roomCode} size={140} />
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
          Share this QR code with participants to join
        </p>
      </Card>

      {/* Participants List */}
      <Card className="space-y-4 bg-neutral-100 dark:bg-neutral-800 p-6 rounded-3xl shadow-2xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Participants ({participants?.length}/{session.maxParticipants})
        </h2>
        <div className="space-y-2">
          {participants?.length ? (
            participants.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-xl shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <span className="text-gray-900 dark:text-white font-medium">
                  {p.name}
                </span>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-xl text-sm transition-all duration-200"
                  onClick={() => handleRemoveParticipant(p.id)}
                >
                  Remove
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No participants yet.
            </p>
          )}
        </div>
      </Card>

      {/* Start Session Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleStartSession}
          disabled={(participants?.length || 0) < 2}
          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-3 rounded-2xl shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        >
          Start Session
        </Button>
      </div>
    </div>
  );
}
