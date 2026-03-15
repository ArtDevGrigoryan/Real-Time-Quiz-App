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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
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
        <Card className="p-6 rounded-3xl shadow-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Label
              htmlFor="maxParticipants"
              className="whitespace-nowrap font-medium text-gray-700 dark:text-gray-300"
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
              className="w-28"
            />

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow"
              onClick={handleCreateSession}
            >
              Create Session
            </Button>
          </div>
        </Card>

        {/* Loading */}
        {loading && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Loading sessions...
          </p>
        )}

        {/* Empty */}
        {!loading && sessions.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 italic">
            No sessions yet.
          </p>
        )}

        {/* Sessions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="p-6 bg-white dark:bg-neutral-800 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between space-y-4 hover:shadow-2xl transition"
            >
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Room Code:{" "}
                  <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wide">
                    {session.roomCode}
                  </span>
                </p>

                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Participants: {session.participants?.length || 0}/
                  {session.maxParticipants}
                </p>

                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  Status:{" "}
                  <span className="capitalize font-medium">
                    {session.status}
                  </span>
                </p>

                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  Created: {new Date(session.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Link
                  to={`/admin/session/${session.id}`}
                  className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-sm font-medium transition"
                >
                  Lobby
                </Link>

                {session.status === "FINISHED" && (
                  <Link
                    to={`/admin/session/${session.id}/results`}
                    className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-medium transition"
                  >
                    Results
                  </Link>
                )}

                <Button
                  onClick={() => handleDelete(session.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 rounded-xl text-sm"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
