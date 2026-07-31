import * as Location from "expo-location";
import { Platform } from "react-native";
import { BACKGROUND_LOCATION_TASK } from "../constants/tracking";

export class LocationPermissionError extends Error {}

/**
 * 포그라운드 권한을 먼저 받은 뒤 백그라운드 권한을 요청해야
 * Android/iOS 권한 단계가 정상적으로 연결됩니다.
 */
export async function ensureLocationPermissions(): Promise<void> {
  const serviceEnabled = await Location.hasServicesEnabledAsync();
  if (!serviceEnabled) {
    throw new LocationPermissionError("기기의 위치 서비스를 켜 주세요.");
  }

  const foreground = await Location.requestForegroundPermissionsAsync();
  if (!foreground.granted) {
    throw new LocationPermissionError("정확한 위치 권한이 필요합니다.");
  }

  const backgroundAvailable =
    await Location.isBackgroundLocationAvailableAsync();
  if (!backgroundAvailable) {
    throw new LocationPermissionError(
      "이 기기에서는 백그라운드 위치 추적을 사용할 수 없습니다.",
    );
  }

  const background = await Location.requestBackgroundPermissionsAsync();
  if (!background.granted) {
    throw new LocationPermissionError(
      "화면이 꺼진 뒤에도 기록하려면 위치 권한을 '항상 허용'으로 설정해 주세요.",
    );
  }
}

export async function startBackgroundTracking(): Promise<void> {
  const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(
    BACKGROUND_LOCATION_TASK,
  );
  if (alreadyStarted) return;

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 1000,
    distanceInterval: 3,
    activityType: Location.ActivityType.Fitness,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    deferredUpdatesDistance: 5,
    deferredUpdatesInterval: 3000,
    foregroundService:
      Platform.OS === "android"
        ? {
            notificationTitle: "EarnFit 러닝 기록 중",
            notificationBody: "화면이 꺼져도 거리와 경로를 기록하고 있습니다.",
            notificationColor: "#CCFF00",
            killServiceOnDestroy: false,
          }
        : undefined,
  });
}

export async function stopBackgroundTracking(): Promise<void> {
  const started = await Location.hasStartedLocationUpdatesAsync(
    BACKGROUND_LOCATION_TASK,
  );
  if (started) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
}
