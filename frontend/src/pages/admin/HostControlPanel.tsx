import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import Toast from "../../components/messagePopup";
import { useSocket } from "../../hooks/useSocket";
import type {
  IActivity,
  ILeaderBoard,
  IParticipant,
  IQuestion,
  ISession,
} from "../../types/app.types";
import type {
  IAnswerResult,
  IChangeQuestion,
  ICurrentState,
  IResponse,
  ISessionStarted,
  ITimerEvent,
} from "../../types/api.types";
import Axios from "../../axios.config";
import LeaderBoard from "../participant/Leaderboard";

export default function HostControlPanel() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { socket } = useSocket();

  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [questionEnded, setQuestionEnded] = useState(false);
  const [leaderboard, setLeaderboard] = useState<ILeaderBoard[]>([]);
  const [participants, setParticipants] = useState<IParticipant[]>([]);
  const [question, setQuestion] = useState<IQuestion | null>(null);
  const [activity, setActivity] = useState<IActivity | null>(null);
  const startedRef = useRef(false);
  const [questionAnsweredId, setQuestionAnsweredId] = useState<string[]>([]);

  const handleNext = () => socket?.emit("next", { sessionId });

  const fetchCurrentState = useCallback(async () => {
    try {
      const { data } = await Axios.get<IResponse<ICurrentState>>(
        `/sessions/${sessionId}/admin`,
      );

      const payload = data.payload;
      setActivity(payload.activity);
      setQuestion(payload.question);
      setParticipants(payload.participants);
      setQuestionAnsweredId(payload.participantAnswers || []);
      setQuestionEnded(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  }, [sessionId]);

  useEffect(() => {
    if (!socket) return;

    fetchCurrentState();

    const handleSessionStarted = (data: ISessionStarted) => {
      setParticipants(data.participants);
      setActivity(data.activity);
      setQuestion(data.question);
      setQuestionAnsweredId([]);
      setQuestionEnded(false);
    };

    const handleTimerUpdate = ({ timeRemaining }: ITimerEvent) => {
      setTimer(timeRemaining);
    };

    const handleTimerEnd = () => setQuestionEnded(true);

    const handleAnswerResult = (data: IAnswerResult) => {
      setQuestionAnsweredId((prev) =>
        prev.includes(data.participantId)
          ? prev
          : [...prev, data.participantId],
      );

      setParticipants((prev) =>
        prev.map((p) =>
          p.id === data.participantId
            ? { ...p, score: p.score + data.score }
            : p,
        ),
      );
    };

    const handleQuestionChanged = (data: IChangeQuestion) => {
      setQuestion(data.question);
      setQuestionAnsweredId([]);
      setQuestionEnded(false);
    };

    const handleActivityChanged = (data: IActivity) => setActivity(data);
    const handleLeaderboardResult = (data: ILeaderBoard[]) => {
      setLeaderboard(data);
      setActivity(null);
      setQuestion(null);
      setError(null);
    };
    const handleUpdateLobby = (data: ISession) => {
      if (data.participants?.length) {
        setParticipants(data.participants);
      }
    };
    socket.on("connect", () => {
      (fetchCurrentState(), socket.emit("admin_joined", { sessionId }));
    });
    socket.on("leaderboard_result", handleLeaderboardResult);
    socket.on("socket_error", setError);
    socket.on("session_started", handleSessionStarted);
    socket.on("timer_update", handleTimerUpdate);
    socket.on("timer_end", handleTimerEnd);
    socket.on("answer_result", handleAnswerResult);
    socket.on("question_changed", handleQuestionChanged);
    socket.on("activity_changed", handleActivityChanged);
    socket.on("lobby_update", handleUpdateLobby);
    if (!startedRef.current) {
      socket.emit("start", { sessionId });
      startedRef.current = true;
    }

    return () => {
      socket.off("connect", fetchCurrentState);
      socket.off("socket_error", setError);
      socket.off("session_started", handleSessionStarted);
      socket.off("timer_update", handleTimerUpdate);
      socket.off("timer_end", handleTimerEnd);
      socket.off("answer_result", handleAnswerResult);
      socket.off("question_changed", handleQuestionChanged);
      socket.off("activity_changed", handleActivityChanged);
      socket.off("leaderboard_result", handleLeaderboardResult);
    };
  }, [socket, sessionId, fetchCurrentState]);

  const sortedParticipants = [...participants].sort(
    (a, b) => b.score - a.score,
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}

      {leaderboard.length ? (
        <LeaderBoard leaderboards={leaderboard} isAdmin={true} />
      ) : (
        questionEnded && (
          <Toast
            type="success"
            message="Time is up"
            onClose={() => setQuestionEnded(false)}
            ttl={1500}
          />
        )
      )}

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight">Host Control</h1>

          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-400">Timer</span>
            <div className="bg-blue-500/10 border border-blue-500/30 px-6 py-2 rounded-xl text-2xl font-bold text-blue-400">
              {timer}s
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Activity */}
          <Card className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg space-y-4">
            <h2 className="text-lg font-semibold text-neutral-200">Activity</h2>

            {activity ? (
              <div className="space-y-2 text-sm text-neutral-300">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Title</span>
                  <span>{activity.title}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-400">Type</span>
                  <span>{activity.type}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-400">Order</span>
                  <span>{activity.order}</span>
                </div>

                {activity.pointsPerCorrect && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Points</span>
                    <span>{activity.pointsPerCorrect}</span>
                  </div>
                )}

                {activity.timerSeconds && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Timer</span>
                    <span>{activity.timerSeconds}s</span>
                  </div>
                )}

                {activity.fragmentsCount && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Fragments</span>
                    <span>{activity.fragmentsCount}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-neutral-500 italic">No activity loaded</p>
            )}
          </Card>

          {/* Question */}
          <Card className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg space-y-4">
            <h2 className="text-lg font-semibold text-neutral-200">Question</h2>

            {question ? (
              <div className="space-y-3">
                <p className="text-neutral-100 text-base">{question.text}</p>

                <div className="text-sm text-neutral-400">
                  Duration: {question.timeLimit}s
                </div>
              </div>
            ) : (
              <p className="text-neutral-500 italic">No question loaded</p>
            )}
          </Card>

          {/* Participants */}
          <Card className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg space-y-4">
            <h2 className="text-lg font-semibold text-neutral-200">
              Participants
            </h2>

            {sortedParticipants.length ? (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {sortedParticipants.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-neutral-800 hover:bg-neutral-700 transition px-4 py-2 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-500 w-5">
                        {i + 1}
                      </span>

                      <span className="font-medium">{p.name}</span>
                    </div>

                    <span
                      className={`font-semibold ${
                        questionAnsweredId.includes(p.id)
                          ? "text-green-400"
                          : "text-blue-400"
                      }`}
                    >
                      {p.score}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 italic">No participants yet</p>
            )}
          </Card>
        </div>

        {/* Controls */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleNext}
            className="px-10 py-4 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 transition shadow-lg"
          >
            Next Question
          </Button>
        </div>
      </div>
    </div>
  );
}
