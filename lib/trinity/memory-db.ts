/**
 * Trinity Memory Database
 * File-based storage for debate messages and state
 */

interface Message {
  role: string;
  content: string;
  persona?: string;
  timestamp?: number;
}

interface DebateState {
  topic: string;
  messages: Message[];
  timestamp: number;
  personas?: string[];
}

interface MemoryStore {
  sessions: Map<string, DebateState>;
}

const store: MemoryStore = {
  sessions: new Map(),
};

export function createSession(sessionId: string, topic: string): DebateState {
  const state: DebateState = {
    topic,
    messages: [],
    personas: [],
    timestamp: Date.now(),
  };
  store.sessions.set(sessionId, state);
  return state;
}

export function pushMessage(
  sessionId: string,
  message: Message
): DebateState | null {
  let state = store.sessions.get(sessionId);
  
  if (!state) {
    state = createSession(sessionId, "default");
  }

  state.messages.push({
    role: message.role,
    content: message.content,
    persona: message.persona,
    timestamp: Date.now(),
  });

  return state;
}

export function getSession(sessionId: string): DebateState | null {
  return store.sessions.get(sessionId) || null;
}

export function updateSession(
  sessionId: string,
  updates: Partial<DebateState>
): DebateState | null {
  const state = store.sessions.get(sessionId);
  if (!state) return null;

  const updated = { ...state, ...updates };
  store.sessions.set(sessionId, updated);
  return updated;
}

export function listSessions(): DebateState[] {
  return Array.from(store.sessions.values());
}

export function clearSession(sessionId: string): boolean {
  return store.sessions.delete(sessionId);
}
