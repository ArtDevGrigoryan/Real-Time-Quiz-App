import { useEffect, useState } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Link } from "react-router-dom";
import Axios from "../../axios.config";
import type { IResponse } from "../../types/api.types";
import type { ICreateSessionResponse } from "../../types/backend.response.types";
import type { ISession } from "../../types/app.types";
import Toast from "../../components/messagePopup";

export default function SessionsList() {
  const [sessions, setSessions] = useState<ISession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maxParticipants, setMaxParticipants] = useState<number>(10);

  const handleDelete = async (id: string) => {
    try {
      await Axios.delete(`/sessions/${id}`);
      setSessions(sessions.filter((session) => session.id != id));
    } catch (err: any) {
      setError(err.data || "something went wrong");
    }
  };
  const getSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await Axios.get<IResponse<ISession[]>>("/sessions");
      setSessions(data.payload);
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSessions();
  }, []);

  const handleCreateSession = async () => {
    try {
      const { data } = await Axios.post<IResponse<ICreateSessionResponse>>(
        "/sessions",
        { maxParticipants },
      );
      setSessions((prev) => [data.payload.session, ...prev]);
    } catch (err: any) {
      setError(err.message || "Network error");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
        Sessions
      </h1>

      {/* Error Toast */}
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError(null)}
          ttl={3000}
        />
      )}

      {/* Create Session */}
      <Card className="flex flex-col md:flex-row items-center gap-4 p-6 bg-neutral-100 dark:bg-neutral-800 rounded-3xl shadow-2xl">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
          <Label
            htmlFor="maxParticipants"
            className="whitespace-nowrap font-medium"
          >
            Max Participants
          </Label>
          <Input
            id="maxParticipants"
            type="number"
            min={2}
            max={100}
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
            className="w-24"
          />
          <Button
            className="flex-1 md:flex-none bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-2 px-6 rounded-2xl shadow-md transition-all duration-200"
            onClick={handleCreateSession}
          >
            Create Session
          </Button>
        </div>
      </Card>

      {/* Loading */}
      {loading && (
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Loading sessions...
        </p>
      )}

      {/* Sessions List */}
      {!loading && sessions.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center italic">
          No sessions yet.
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {sessions.map((session) => (
          <Card
            key={session.id}
            className="p-6 flex flex-col justify-between bg-neutral-100 dark:bg-neutral-800 rounded-3xl shadow-2xl space-y-4 transition hover:scale-[1.01]"
          >
            <div className="space-y-2">
              <p className="font-semibold text-gray-900 dark:text-white text-lg">
                Room Code:{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {session.roomCode}
                </span>
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Participants: {session.participants?.length || 0}/
                {session.maxParticipants}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Status: <span className="capitalize">{session.status}</span> |
                Created: {new Date(session.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-3 mt-2">
              <Link
                to={`/admin/session/${session.id}`}
                className="flex-1 text-center bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white py-2 rounded-xl font-medium transition-all duration-200"
              >
                Lobby
              </Link>
              {session.status === "FINISHED" && (
                <Link
                  to={`/admin/session/${session.id}/results`}
                  className="flex-1 text-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white py-2 rounded-xl font-medium transition-all duration-200"
                >
                  Results
                </Link>
              )}
              <Button onClick={() => handleDelete(session.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
