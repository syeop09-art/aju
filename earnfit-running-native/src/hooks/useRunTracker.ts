import { useCallback, useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import {
  activeDurationMs,
  paceSecondsPerKm,
} from "../domain/locationMath";
import {
  clearRunSession,
  getRunSession,
  saveRunSession,
} from "../repositories/runSessionRepository";
import {
  ensureLocationPermissions,
  startBackgroundTracking,
  stopBackgroundTracking,
} from "../services/locationTrackingService";
import { createEmptySession, type RunSession } from "../types/run";

export function useRunTracker() {
  const [session, setSession] = useState<RunSession>(createEmptySession);
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setSession(await getRunSession());
    setNow(Date.now());
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 1000);
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") void refresh();
    });

    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [refresh]);

  const runAction = useCallback(
    async (action: () => Promise<void>) => {
      setBusy(true);
      setError(null);
      try {
        await action();
        await refresh();
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "러닝 기록 중 오류가 발생했습니다.",
        );
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const start = useCallback(
    () =>
      runAction(async () => {
        await ensureLocationPermissions();
        const timestamp = Date.now();
        const next: RunSession = {
          ...createEmptySession(),
          id: `run-${timestamp}`,
          status: "running",
          startedAt: timestamp,
          activeStartedAt: timestamp,
          updatedAt: timestamp,
        };
        await saveRunSession(next);
        try {
          await startBackgroundTracking();
        } catch (caught) {
          await clearRunSession();
          throw caught;
        }
      }),
    [runAction],
  );

  const pause = useCallback(
    () =>
      runAction(async () => {
        await stopBackgroundTracking();
        const current = await getRunSession();
        const timestamp = Date.now();
        await saveRunSession({
          ...current,
          status: "paused",
          accumulatedActiveMs: activeDurationMs(
            current.accumulatedActiveMs,
            current.activeStartedAt,
            timestamp,
          ),
          activeStartedAt: null,
          updatedAt: timestamp,
        });
      }),
    [runAction],
  );

  const resume = useCallback(
    () =>
      runAction(async () => {
        await ensureLocationPermissions();
        const current = await getRunSession();
        const timestamp = Date.now();
        await saveRunSession({
          ...current,
          status: "running",
          activeStartedAt: timestamp,
          updatedAt: timestamp,
        });
        try {
          await startBackgroundTracking();
        } catch (caught) {
          await saveRunSession({
            ...current,
            status: "paused",
            activeStartedAt: null,
            updatedAt: timestamp,
          });
          throw caught;
        }
      }),
    [runAction],
  );

  const finish = useCallback(
    () =>
      runAction(async () => {
        await stopBackgroundTracking();
        const current = await getRunSession();
        const timestamp = Date.now();
        await saveRunSession({
          ...current,
          status: "finished",
          accumulatedActiveMs: activeDurationMs(
            current.accumulatedActiveMs,
            current.activeStartedAt,
            timestamp,
          ),
          activeStartedAt: null,
          endedAt: timestamp,
          updatedAt: timestamp,
        });
      }),
    [runAction],
  );

  const reset = useCallback(
    () =>
      runAction(async () => {
        await stopBackgroundTracking();
        await clearRunSession();
      }),
    [runAction],
  );

  const metrics = useMemo(() => {
    const durationMs = activeDurationMs(
      session.accumulatedActiveMs,
      session.activeStartedAt,
      now,
    );
    return {
      durationMs,
      paceSecondsPerKm: paceSecondsPerKm(session.distanceKm, durationMs),
      calories: Math.round(session.distanceKm * 72),
    };
  }, [now, session]);

  return {
    session,
    metrics,
    busy,
    error,
    start,
    pause,
    resume,
    finish,
    reset,
  };
}
