export const BACKGROUND_LOCATION_TASK = "earnfit-background-running";
export const RUN_SESSION_STORAGE_KEY = "@earnfit/run-session/v1";

export const TRACKING_OPTIONS = {
  // 정확도 35m 초과 좌표는 신호 튐으로 판단합니다.
  maxAccuracyMeters: 35,
  // 3m 미만 이동은 정지 상태의 GPS 흔들림으로 간주합니다.
  minDistanceMeters: 3,
  // 30km/h 초과 구간은 러닝으로 보기 어려워 제외합니다.
  maxSpeedKmh: 30,
} as const;
