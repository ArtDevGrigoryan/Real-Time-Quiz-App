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
    <div className="min-h-screen bg-neutral-900 text-gray-100 p-6 md:p-10">
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

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Host Panel
          </h1>
          <div className="text-3xl font-extrabold text-blue-400">{timer}s</div>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Activity Card */}
          <Card className="p-6 bg-neutral-800 border border-neutral-700 rounded-3xl shadow-2xl space-y-4 hover:scale-[1.02] transition-transform duration-200">
            <h2 className="text-xl font-semibold text-gray-200">Activity</h2>
            {activity ? (
              <div className="space-y-2 text-sm text-gray-300">
                <div>
                  <span className="font-medium text-gray-100">Title:</span>{" "}
                  {activity.title}
                </div>
                <div>
                  <span className="font-medium text-gray-100">Type:</span>{" "}
                  {activity.type}
                </div>
                <div>
                  <span className="font-medium text-gray-100">Order:</span>{" "}
                  {activity.order}
                </div>
                {activity.pointsPerCorrect && (
                  <div>
                    <span className="font-medium text-gray-100">
                      Points/Correct:
                    </span>{" "}
                    {activity.pointsPerCorrect}
                  </div>
                )}
                {activity.timerSeconds && (
                  <div>
                    <span className="font-medium text-gray-100">Timer:</span>{" "}
                    {activity.timerSeconds}s
                  </div>
                )}
                {activity.fragmentsCount && (
                  <div>
                    <span className="font-medium text-gray-100">
                      Fragments:
                    </span>{" "}
                    {activity.fragmentsCount}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 italic">No activity loaded</p>
            )}
          </Card>

          {/* Question Card */}
          <Card className="p-6 bg-neutral-800 border border-neutral-700 rounded-3xl shadow-2xl space-y-4 hover:scale-[1.02] transition-transform duration-200">
            <h2 className="text-xl font-semibold text-gray-200">Question</h2>
            {question ? (
              <div className="space-y-2 text-sm text-gray-300">
                <div className="text-base font-medium">{question.text}</div>
                <div className="text-gray-400">
                  Duration: {question.timeLimit}s
                </div>
              </div>
            ) : (
              <p className="text-gray-400 italic">No question loaded</p>
            )}
          </Card>

          {/* Participants Card */}
          <Card className="p-6 bg-neutral-800 border border-neutral-700 rounded-3xl shadow-2xl space-y-4 hover:scale-[1.02] transition-transform duration-200">
            <h2 className="text-xl font-semibold text-gray-200">
              Participants
            </h2>
            {sortedParticipants.length ? (
              <div className="space-y-2">
                {sortedParticipants.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center bg-neutral-700/50 px-4 py-2 rounded-xl hover:bg-neutral-700/70 transition-colors"
                  >
                    <span className="text-gray-100 font-medium">
                      {i + 1}. {p.name}
                    </span>
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
              <p className="text-gray-400 italic">No participants yet</p>
            )}
          </Card>
        </div>

        {/* Next Button */}
        <div className="flex justify-center">
          <Button
            className="bg-blue-500 hover:bg-blue-600 px-12 py-4 text-lg rounded-2xl shadow-xl transition-all duration-200"
            onClick={handleNext}
          >
            Next Question
          </Button>
        </div>
      </div>
    </div>
  );
}
