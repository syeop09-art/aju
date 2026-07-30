import { TRACKING_OPTIONS } from "../constants/tracking";
import type { RawGpsSample, RunPoint } from "../types/run";
import { haversineKm } from "./locationMath";

export type RejectionReason =
  | "poor-accuracy"
  | "stale-timestamp"
  | "gps-jump"
  | "stationary-noise";

export type FilterResult =
  | { accepted: true; point: RunPoint; distanceKm: number }
  | { accepted: false; reason: RejectionReason };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * 정확도·최소 이동거리·최대 속도·가중 평활화를 결합한 GPS 필터입니다.
 * 지도에는 필터를 통과한 좌표만 추가되므로 신호 튐이 Polyline에 남지 않습니다.
 */
export function filterGpsSample(
  previous: RunPoint | undefined,
  raw: RawGpsSample,
): FilterResult {
  const accuracy = raw.accuracy ?? Number.POSITIVE_INFINITY;

  if (accuracy > TRACKING_OPTIONS.maxAccuracyMeters) {
    return { accepted: false, reason: "poor-accuracy" };
  }

  const rawPoint: RunPoint = {
    latitude: raw.latitude,
    longitude: raw.longitude,
    accuracy,
    timestamp: raw.timestamp,
  };

  if (!previous) {
    return { accepted: true, point: rawPoint, distanceKm: 0 };
  }

  const elapsedSeconds = (raw.timestamp - previous.timestamp) / 1000;
  if (elapsedSeconds <= 0) {
    return { accepted: false, reason: "stale-timestamp" };
  }

  // 평활화 전에 원본 속도를 검사해 순간이동 좌표를 먼저 차단합니다.
  const rawDistanceKm = haversineKm(previous, rawPoint);
  const rawSpeedKmh = rawDistanceKm / (elapsedSeconds / 3600);
  if (rawSpeedKmh > TRACKING_OPTIONS.maxSpeedKmh) {
    return { accepted: false, reason: "gps-jump" };
  }

  // 정확한 좌표일수록 새 위치에 더 큰 가중치를 둡니다.
  const alpha = clamp(
    0.25 +
      ((TRACKING_OPTIONS.maxAccuracyMeters - accuracy) /
        TRACKING_OPTIONS.maxAccuracyMeters) *
        0.55,
    0.25,
    0.8,
  );
  const smoothedPoint: RunPoint = {
    latitude: previous.latitude + (raw.latitude - previous.latitude) * alpha,
    longitude: previous.longitude + (raw.longitude - previous.longitude) * alpha,
    accuracy,
    timestamp: raw.timestamp,
  };

  const distanceKm = haversineKm(previous, smoothedPoint);
  if (distanceKm * 1000 < TRACKING_OPTIONS.minDistanceMeters) {
    return { accepted: false, reason: "stationary-noise" };
  }

  return { accepted: true, point: smoothedPoint, distanceKm };
}
