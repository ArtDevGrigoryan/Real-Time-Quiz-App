import React, { useState } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useNavigate } from "react-router-dom";
import Axios from "../../axios.config";
import type { IResponse } from "../../types/api.types";
import Toast from "../../components/messagePopup";

export const JoinPage: React.FC = () => {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const joinSession = async () => {
    if (!name.trim() || !roomCode.trim()) {
      setError("Both Session ID and Nickname are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await Axios.post<
        IResponse<{ participantId: string; sessionId: string }>
      >("/participants/join", { roomCode, name });

      localStorage.setItem("sessionId", data.payload.sessionId);
      localStorage.setItem("participantId", data.payload.participantId);
      navigate(`/waiting/${roomCode}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to join session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 gap-6">
      <Card className="max-w-md w-full p-10 rounded-3xl shadow-2xl space-y-6 bg-neutral-100 dark:bg-neutral-800 transition-colors duration-300">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center">
          Join a Session
        </h2>

        {/* Error Toast */}
        {error && (
          <Toast
            message={error}
            type="error"
            onClose={() => setError(null)}
            ttl={3000}
          />
        )}

        <div className="space-y-4">
          <Input
            placeholder="Session ID"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            disabled={loading}
            className="focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition-all duration-200 rounded-xl"
          />
          <Input
            placeholder="Nickname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition-all duration-200 rounded-xl"
          />
        </div>

        <Button
          onClick={joinSession}
          disabled={loading || !name.trim() || !roomCode.trim()}
          className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-3 rounded-2xl shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Joining..." : "Join"}
        </Button>

        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-2">
          Enter the session ID and your nickname to join a live session
        </p>
      </Card>

      {/* Admin login button */}
      <div className="flex justify-center">
        <Button
          onClick={() => navigate("/admin/login")}
          className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-2xl shadow-md transition-all duration-200"
        >
          Login as Admin
        </Button>
      </div>
    </div>
  );
};

export default JoinPage;
