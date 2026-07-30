import type { RunPoint } from "../types/run";

const EARTH_RADIUS_KM = 6371.0088;

const toRadians = (degree: number) => (degree * Math.PI) / 180;

/**
 * 두 위경도 사이의 대권 거리를 Haversine 공식으로 계산합니다.
 */
export function haversineKm(
  from: Pick<RunPoint, "latitude" | "longitude">,
  to: Pick<RunPoint, "latitude" | "longitude">,
): number {
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function activeDurationMs(
  accumulatedActiveMs: number,
  activeStartedAt: number | null,
  now = Date.now(),
): number {
  return (
    accumulatedActiveMs +
    (activeStartedAt === null ? 0 : Math.max(0, now - activeStartedAt))
  );
}

export function paceSecondsPerKm(
  distanceKm: number,
  durationMs: number,
): number | null {
  if (distanceKm <= 0.01 || durationMs <= 0) return null;
  return durationMs / 1000 / distanceKm;
}

export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatPace(secondsPerKm: number | null): string {
  if (secondsPerKm === null || !Number.isFinite(secondsPerKm)) return "--'--\"";
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.floor(secondsPerKm % 60);
  return `${minutes}'${String(seconds).padStart(2, "0")}"`;
}
