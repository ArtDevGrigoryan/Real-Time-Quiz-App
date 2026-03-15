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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-10">
      {error && <Toast message={error} type="error" onClose={() => {}} />}

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Session Lobby
          </h1>

          <div
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
              connected
                ? "bg-green-500/10 text-green-500"
                : "bg-red-500/10 text-red-500"
            }`}
          >
            Socket {connected ? "Connected" : "Disconnected"}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Room Code / QR */}
          <Card className="flex flex-col items-center justify-center text-center bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-xl space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Room Code
              </p>

              <p className="text-3xl font-bold tracking-widest text-blue-500">
                {session.roomCode}
              </p>
            </div>

            <QRCodeCanvas value={session.roomCode} size={170} />

            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Participants can scan this QR code or enter the room code to join
              the session.
            </p>
          </Card>

          {/* Participants */}
          <Card className="bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-xl space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Participants ({participants?.length}/{session.maxParticipants})
            </h2>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {participants?.length ? (
                participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {p.name}
                    </span>

                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded-lg"
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
        </div>

        {/* Start Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleStartSession}
            disabled={(participants?.length || 0) < 2}
            className="px-10 py-4 text-lg rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Session
          </Button>
        </div>
      </div>
    </div>
  );
}
