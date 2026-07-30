export type RunStatus = "idle" | "running" | "paused" | "finished";

export interface RunPoint {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface RawGpsSample {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export interface RunSession {
  id: string | null;
  status: RunStatus;
  points: RunPoint[];
  distanceKm: number;
  startedAt: number | null;
  endedAt: number | null;
  activeStartedAt: number | null;
  accumulatedActiveMs: number;
  rejectedPointCount: number;
  updatedAt: number;
}

export const createEmptySession = (): RunSession => ({
  id: null,
  status: "idle",
  points: [],
  distanceKm: 0,
  startedAt: null,
  endedAt: null,
  activeStartedAt: null,
  accumulatedActiveMs: 0,
  rejectedPointCount: 0,
  updatedAt: Date.now(),
});
