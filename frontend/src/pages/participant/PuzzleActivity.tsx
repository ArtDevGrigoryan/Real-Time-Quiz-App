import { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useSocket } from "../../hooks/useSocket";
import Toast from "../../components/messagePopup";
import type { IActivity } from "../../types/app.types";

interface IPuzzleActivityProps {
  activity: IActivity;
  answered: boolean;
  correctCountt: number | null;
  onAnswered: (data: boolean) => void;
}

export default function PuzzleActivity({
  activity,
  onAnswered,
  answered,
  correctCountt,
}: IPuzzleActivityProps) {
  const { socket, connected } = useSocket();

  const [selected, setSelected] = useState<number[]>([]);
  const [timer, setTimer] = useState(activity.timerSeconds || 20);
  const [error, setError] = useState<string | null>(null);

  const fragments = activity.fragmentsCount || 4;

  useEffect(() => {
    const handleTimerUpdate = (data: { timeRemaining: number }) =>
      setTimer(data.timeRemaining);

    const handleTimerEnd = () => onAnswered(true);

    const handleSocketError = (data: { message: string }) =>
      setError(data.message);

    socket?.on("timer_update", handleTimerUpdate);
    socket?.on("timer_end", handleTimerEnd);
    socket?.on("socket_error", handleSocketError);

    return () => {
      socket?.off("timer_update", handleTimerUpdate);
      socket?.off("timer_end", handleTimerEnd);
      socket?.off("socket_error", handleSocketError);
    };
  }, [socket, onAnswered]);

  const toggleFragment = (index: number) => {
    if (answered || timer <= 0) return;

    setSelected((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      return [...prev, index];
    });
  };

  const submitScore = () => {
    try {
      socket?.emit("answer", {
        type: "PUZZLE",
        activityId: activity.id,
        correctCount: selected.length,
      });

      onAnswered(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit score");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-900">
      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}

      {!connected ? (
        <p className="text-gray-400">Connecting...</p>
      ) : (
        <Card className="max-w-md w-full p-6 space-y-6 bg-neutral-800 border border-neutral-700 rounded-3xl shadow-2xl">
          <h2 className="text-3xl font-extrabold text-center text-gray-100">
            {activity.title}
          </h2>

          <p className="text-gray-300 text-sm text-center">
            {activity.description}
          </p>

          <div className="text-center font-semibold text-lg text-blue-400">
            Time Remaining: {timer}s
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: fragments }).map((_, i) => {
              const active = selected.includes(i);

              return (
                <Button
                  key={i}
                  disabled={answered || timer <= 0}
                  onClick={() => toggleFragment(i)}
                  className={`py-3 px-4 rounded-2xl border transition-all
                    ${
                      active
                        ? "bg-blue-500 border-blue-400 text-white"
                        : "bg-neutral-700/50 border-neutral-600 hover:bg-neutral-700"
                    }
                    ${answered ? "cursor-not-allowed opacity-60" : ""}
                  `}
                >
                  Fragment {i + 1}
                </Button>
              );
            })}
          </div>

          <div className="text-center text-gray-300 font-medium">
            Selected: {selected.length || correctCountt}/{fragments}
          </div>

          <Button
            disabled={answered || timer <= 0}
            onClick={submitScore}
            className={`w-full py-3 rounded-2xl font-semibold transition-all
              ${
                answered || timer <= 0
                  ? "bg-neutral-700 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }
            `}
          >
            {answered ? "Score Submitted" : "Submit Score"}
          </Button>
        </Card>
      )}
    </div>
  );
}
