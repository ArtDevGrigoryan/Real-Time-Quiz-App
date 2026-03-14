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
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-neutral-900 rounded-2xl shadow-xl p-8">
        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Session Results</h1>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition"
          >
            Back
          </button>
        </div>

        {/* error */}
        {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

        {/* leaderboard */}
        <div className="overflow-hidden rounded-xl border border-neutral-800">
          <table className="w-full text-left">
            <thead className="bg-neutral-800 text-neutral-300 text-sm">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3 text-right">Score</th>
              </tr>
            </thead>

            <tbody>
              {leaderboard.map((player) => (
                <tr
                  key={player.participantId}
                  className="border-t border-neutral-800 hover:bg-neutral-800/60 transition"
                >
                  <td className="px-4 py-3 font-medium">#{player.rank}</td>

                  <td className="px-4 py-3">{player.name}</td>

                  <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                    {player.score}
                  </td>
                </tr>
              ))}

              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-neutral-400">
                    No results yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
