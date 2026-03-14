type SessionRuntime = {
  questionId: string;
  activityId: string;
  activityIndex: number;
  questionIndex?: number;
  startTime: number;
  duration: number;
};

const sessionsRuntime = new Map<string, SessionRuntime>();

export const addSession = (sessionId: string, sessionState: SessionRuntime) => {
  sessionsRuntime.set(sessionId, sessionState);
};
export const updateSession = (
  sessionId: string,
  sessionState: SessionRuntime,
) => {
  sessionsRuntime.delete(sessionId);
  sessionsRuntime.set(sessionId, sessionState);
};
export const removeSession = (sessionId: string) => {
  sessionsRuntime.delete(sessionId);
};
export const getSesssionState = (sessionId: string) => {
  return sessionsRuntime.get(sessionId);
};
