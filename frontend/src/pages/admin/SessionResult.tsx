import { useEffect, useState } from "react";
import Axios from "../../axios.config";
import type { IResponse } from "../../types/api.types";
import type { ILeaderBoard } from "../../types/app.types";
import { useParams, useNavigate } from "react-router-dom";

export default function SessionResult() {
  const [error, setError] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<ILeaderBoard[]>([]);
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const fetchSessionResult = async () => {
    try {
      const { data } = await Axios.get<IResponse<ILeaderBoard[]>>(
        `/sessions/${sessionId}/results`,
      );
      setLeaderboard(data.payload);
    } catch (err: any) {
      setError(err.message || "something went wrong");
    }
  };

  useEffect(() => {
    fetchSessionResult();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-4xl bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-800 p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Session Results</h1>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm transition"
          >
            ← Back
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Leaderboard */}
        <div className="overflow-hidden rounded-2xl border border-neutral-800">
          <table className="w-full text-left">
            <thead className="bg-neutral-800 text-neutral-300 text-sm">
              <tr>
                <th className="px-6 py-3">Rank</th>
                <th className="px-6 py-3">Player</th>
                <th className="px-6 py-3 text-right">Score</th>
              </tr>
            </thead>

            <tbody>
              {leaderboard.map((player) => (
                <tr
                  key={player.participantId}
                  className={`border-t border-neutral-800 hover:bg-neutral-800/60 transition ${
                    player.rank === 1
                      ? "bg-yellow-500/10"
                      : player.rank === 2
                        ? "bg-gray-400/10"
                        : player.rank === 3
                          ? "bg-orange-500/10"
                          : ""
                  }`}
                >
                  <td className="px-6 py-3 font-semibold text-neutral-300">
                    #{player.rank}
                  </td>

                  <td className="px-6 py-3 font-medium">{player.name}</td>

                  <td className="px-6 py-3 text-right font-bold text-emerald-400">
                    {player.score}
                  </td>
                </tr>
              ))}

              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-neutral-400">
                    No results yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {leaderboard.length > 0 && (
          <div className="text-center text-sm text-neutral-400 pt-2">
            Total Participants: {leaderboard.length}
          </div>
        )}
      </div>
    </div>
  );
}
