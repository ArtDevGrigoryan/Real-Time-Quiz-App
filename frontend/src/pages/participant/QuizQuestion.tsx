import { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useSocket } from "../../hooks/useSocket";
import type { IQuestion } from "../../types/app.types";

interface QuizQuestionProps {
  question: IQuestion | null;
  answered: boolean;
  selectedIdx: number | null;
  onAnswered: (data: boolean) => void;
}

export default function QuizQuestion({
  question,
  answered,
  selectedIdx,
  onAnswered,
}: QuizQuestionProps) {
  const { socket } = useSocket();
  const participantId = localStorage.getItem("participantId")!;

  const [selected, setSelected] = useState<number | null>(selectedIdx);
  const [timer, setTimer] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    setResult(
      typeof selectedIdx === "number"
        ? selectedIdx === question?.correctIdx
          ? "correct"
          : "wrong"
        : null,
    );
  }, [question, selectedIdx]);

  const submitAnswer = (idx: number) => {
    if (!question || answered) return;
    setSelected(idx);
    onAnswered(true);
    socket?.emit("answer", {
      type: "QUIZ",
      questionId: question.id,
      selectedIdx: idx,
    });
  };

  useEffect(() => {
    const handleTimerUpdate = (data: { timeRemaining: number }) =>
      setTimer(data.timeRemaining);
    const handleTimerEnd = () => onAnswered(true);
    const handleAnswerResult = (data: {
      participantId: string;
      isCorrect: boolean;
    }) => {
      if (data.participantId !== participantId) return;
      setResult(data.isCorrect ? "correct" : "wrong");
    };

    socket?.on("timer_update", handleTimerUpdate);
    socket?.on("timer_end", handleTimerEnd);
    socket?.on("answer_result", handleAnswerResult);

    return () => {
      socket?.off("timer_update", handleTimerUpdate);
      socket?.off("timer_end", handleTimerEnd);
      socket?.off("answer_result", handleAnswerResult);
    };
  }, [socket, participantId, onAnswered]);

  if (!question) return null;

  const progress =
    question.timeLimit > 0 ? (timer / question.timeLimit) * 100 : 0;

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-white p-6">
      <Card className="w-full max-w-2xl p-8 space-y-8 bg-neutral-800 border border-neutral-700 rounded-3xl shadow-2xl transition-colors duration-300">
        {/* Timer */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-200">Question</h2>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-300">{timer}s</span>
          </div>
        </div>

        {/* Question Text */}
        <div className="text-xl font-semibold text-gray-100">
          {question.text}
        </div>

        {/* Options */}
        <div className="grid gap-3">
          {question.options?.map((opt, idx) => {
            const isSelected = selected === idx;
            let style = "";
            if (result === "correct" && isSelected)
              style = "bg-green-700 border-green-500";
            if (result === "wrong" && isSelected)
              style = "bg-red-700 border-red-500";

            return (
              <Button
                key={opt.id}
                disabled={answered || timer <= 0}
                onClick={() => submitAnswer(idx)}
                className={`justify-start text-left py-4 px-4 border rounded-2xl font-medium transition-colors duration-200 ${
                  style ||
                  (!answered ? "hover:bg-neutral-700 bg-neutral-700/50" : "")
                }`}
              >
                <span className="font-semibold text-gray-400 mr-3">
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt.text}
              </Button>
            );
          })}
        </div>

        {/* Result */}
        {answered && (
          <div className="text-center text-sm text-gray-400">
            {result === null
              ? "Answer submitted • waiting for result..."
              : result === "correct"
                ? "Correct answer!"
                : "Wrong answer"}
          </div>
        )}
      </Card>
    </div>
  );
}
