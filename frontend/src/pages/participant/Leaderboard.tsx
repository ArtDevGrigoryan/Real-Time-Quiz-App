import { useNavigate } from "react-router-dom";
import type { ILeaderBoard } from "../../types/app.types";
import { Button } from "../../components/ui/button";

interface ILeaderBoardProp {
  leaderboards: ILeaderBoard[];
  isAdmin?: boolean;
}

export default function LeaderBoard({
  leaderboards,
  isAdmin,
}: ILeaderBoardProp) {
  const navigate = useNavigate();

  if (!leaderboards || leaderboards.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500 dark:text-gray-400">
        No participants yet
      </div>
    );
  }
  const handleClick = () => {
    if (isAdmin) {
      navigate("/admin/sessions");
    } else {
      navigate("/");
    }
  };
  const top5 = leaderboards.slice(0, 5);
  const myId = localStorage.getItem("participantId");
  const myRank = myId
    ? leaderboards.findIndex((p) => p.participantId === myId) + 1
    : null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-6 z-50">
      <div className="w-full max-w-md bg-neutral-900 dark:bg-neutral-800 text-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-neutral-700">
          <h2 className="text-3xl font-extrabold text-center">Leaderboard</h2>
        </div>

        {/* Leaderboard List */}
        <ul className="flex-1 overflow-y-auto p-6 space-y-3">
          {top5.map((p) => (
            <li
              key={p.participantId}
              className={`flex justify-between items-center p-3 rounded-2xl shadow-sm transition-colors duration-200 ${
                p.participantId === myId
                  ? "bg-green-600 text-white font-semibold"
                  : "bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600"
              }`}
            >
              <span className="font-medium">
                #{p.rank} {p.name}
              </span>
              <span className="font-semibold text-blue-400">{p.score}</span>
            </li>
          ))}
        </ul>

        {/* My rank */}
        {myRank && myRank > 5 && (
          <div className="text-center text-gray-400 text-sm p-3 border-t border-neutral-700">
            Your rank: {myRank}
          </div>
        )}

        {/* Home button */}
        <div className="p-6 border-t border-neutral-700 flex justify-center">
          <Button
            onClick={handleClick}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-2 rounded-2xl shadow-md transition-all duration-200"
          >
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
