// Client-side storage for the in-flight respondent session.
//
// The session id (returned when an access code is validated) and the
// answers-so-far live in localStorage so the one-by-one flow can resume
// across page navigations and refreshes without a network round-trip.

const SESSION_KEY = "frost.sessionId";
const answersKey = (id: string) => `frost.answers.${id}`;

/** questionId (1..35) -> Likert value (1..5). */
export type CachedAnswers = Record<number, number>;

const hasWindow = () => typeof window !== "undefined";

export function saveSessionId(id: string): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(SESSION_KEY, id);
}

export function findInFlightSessionId(): string | null {
  if (!hasWindow()) return null;
  return window.localStorage.getItem(SESSION_KEY);
}

export function clearSession(): void {
  if (!hasWindow()) return;
  const id = window.localStorage.getItem(SESSION_KEY);
  if (id) window.localStorage.removeItem(answersKey(id));
  window.localStorage.removeItem(SESSION_KEY);
}

export function loadCachedAnswers(id: string): CachedAnswers | null {
  if (!hasWindow()) return null;
  const raw = window.localStorage.getItem(answersKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedAnswers;
  } catch {
    return null;
  }
}

export function saveCachedAnswers(id: string, answers: CachedAnswers): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(answersKey(id), JSON.stringify(answers));
}

export function updateCachedAnswer(
  id: string,
  questionId: number,
  value: number,
): CachedAnswers {
  const current = loadCachedAnswers(id) ?? {};
  current[questionId] = value;
  saveCachedAnswers(id, current);
  return current;
}
