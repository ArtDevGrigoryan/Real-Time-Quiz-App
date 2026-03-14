import { useEffect, useState } from "react";
import { useSocket } from "../../hooks/useSocket";
import type {
  IActivity,
  ILeaderBoard,
  IParticipant,
  IQuestion,
  ISession,
} from "../../types/app.types";
import QuizQuestion from "./QuizQuestion";
import PuzzleActivity from "./PuzzleActivity";
import Toast from "../../components/messagePopup";
import type {
  IAnswerResult,
  IChangeQuestion,
  IErrorEvent,
  IResponse,
  ISessionStarted,
  ISessionState,
} from "../../types/api.types";
import Axios from "../../axios.config";
import { useNavigate, useParams } from "react-router-dom";
import LeaderBoard from "./Leaderboard";

export default function WaitingRoom() {
  const { socket, connected } = useSocket();
  const participantId = localStorage.getItem("participantId")!;
  const sessionId = localStorage.getItem("sessionId")!;
  const { roomCode } = useParams();

  const [participants, setParticipants] = useState<IParticipant[]>([]);
  const [question, setQuestion] = useState<IQuestion | null>(null);
  const [activity, setActivity] = useState<IActivity | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState<number | null>(null);
  const [started, setStarted] = useState<boolean>(false);
  const [ended, setEnded] = useState<boolean>(false);
  const [leaderboard, setLeaderBoard] = useState<ILeaderBoard[]>([]);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scoreUpdated, setScoreUpdated] = useState<boolean>(false);
  const navigate = useNavigate();

  const fetchCurrentState = async () => {
    try {
      const { data } = await Axios.get<IResponse<ISessionState | null>>(
        `/sessions/${roomCode}/state/${participantId}`,
      );
      if (!data.payload || !data.payload.started) {
        setStarted(Boolean(data.payload?.started));
        return;
      }
      if (data.payload.type === "QUIZ") {
        setSelectedIdx(data.payload.selectedIndex);
        setCorrectCount(null);
      } else {
        setCorrectCount(data.payload.correctCount);
        setSelectedIdx(null);
      }
      setStarted(true);
      setAnswered(data.payload.alreadyAnswered);
      setActivity(data.payload.activity);
      setQuestion(data.payload.question);
      setScore(data.payload.score);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (!socket || !participantId || !sessionId) return;

    const handleReconnect = async () => {
      await fetchCurrentState();
      socket.emit("join_session", { participantId, sessionId });
    };

    socket.on("connect", handleReconnect);
    socket.emit("join_session", { participantId, sessionId });

    const handlers = {
      leaderboard_result: (data: ILeaderBoard[]) => {
        setLeaderBoard(data);
        setEnded(true);
      },
      lobby_update: (data: ISession) =>
        setParticipants(data.participants || []),
      participant_joined: (data: IParticipant[]) => setParticipants(data),
      disjoined: (id: string) => {
        setParticipants((prev) => prev.filter((p) => p.id !== id));
        if (participantId == id) {
          navigate("/");
        }
      },
      session_started: (data: ISessionStarted) => {
        setStarted(true);
        setAnswered(false);
        setParticipants(data.participants);
        setQuestion(data.question);
        setActivity(data.activity);
      },
      question_changed: ({ question }: IChangeQuestion) => {
        setAnswered(false);
        setSelectedIdx(null);
        setCorrectCount(null);
        setQuestion(question);
      },
      activity_changed: (data: IActivity) => {
        setSelectedIdx(null);
        setCorrectCount(null);
        setAnswered(false);
        setActivity(data);
      },
      answer_result: (data: IAnswerResult) => {
        if (data.participantId === participantId) {
          setScoreUpdated(true);
          setTimeout(() => setScoreUpdated(false), 1000);
          setScore((prev) => prev + data.score);
          setCorrectCount(data.correctCount || 0);
        }
      },
      socket_error: ({ message }: IErrorEvent) => setError(message),
    };

    for (const [event, handler] of Object.entries(handlers)) {
      socket.on(event, handler);
    }

    return () => {
      for (const [event, handler] of Object.entries(handlers)) {
        socket.off(event, handler);
      }
    };
  }, [socket, participantId, sessionId]);

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-6 text-white">
      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}

      {!started ? (
        <div className="w-full max-w-md p-6 space-y-6 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center">Waiting Room</h1>
          <div className="text-center text-sm">
            Room Code:{" "}
            <span className="font-mono text-blue-400">{roomCode}</span>
          </div>
          <div
            className={`text-center text-xs ${
              connected ? "text-green-400" : "text-red-400"
            }`}
          >
            {connected ? "Socket Connected" : "Socket Disconnected"}
          </div>

          <div className="space-y-2">
            {participants.map((p) => (
              <div
                key={p.id}
                className={`flex justify-between items-center px-4 py-2 rounded-md bg-neutral-700 ${
                  p.id === participantId ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <span>{p.name}</span>
                {p.id === participantId && (
                  <span className="text-xs text-gray-300">You</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : activity?.type === "PUZZLE_ASSEMBLY" ? (
        <PuzzleActivity
          activity={activity}
          answered={answered}
          correctCountt={correctCount}
          onAnswered={setAnswered}
        />
      ) : (
        <QuizQuestion
          question={question}
          selectedIdx={selectedIdx}
          answered={answered}
          onAnswered={setAnswered}
        />
      )}

      {/* Score display */}
      <div
        className={`absolute top-4 right-6 text-sm font-semibold ${
          scoreUpdated ? "text-green-400 animate-pulse" : "text-gray-400"
        }`}
      >
        Score: {score}
      </div>

      {/* Final Leaderboard */}
      {ended && <LeaderBoard leaderboards={leaderboard} />}
    </div>
  );
}
