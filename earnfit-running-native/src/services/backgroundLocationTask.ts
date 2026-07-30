import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { BACKGROUND_LOCATION_TASK } from "../constants/tracking";
import { filterGpsSample } from "../domain/locationFilter";
import {
  getRunSession,
  saveRunSession,
} from "../repositories/runSessionRepository";

interface BackgroundLocationData {
  locations: Location.LocationObject[];
}

/**
 * 반드시 React 컴포넌트 바깥의 전역 스코프에서 등록해야 합니다.
 * 운영체제가 백그라운드에서 앱 UI 없이 JS만 깨워도 이 작업이 실행됩니다.
 */
TaskManager.defineTask<BackgroundLocationData>(
  BACKGROUND_LOCATION_TASK,
  async ({ data, error }) => {
    if (error || !data?.locations?.length) return;

    const session = await getRunSession();
    if (session.status !== "running") return;

    let lastPoint = session.points.at(-1);
    let rejectedPointCount = session.rejectedPointCount;
    let distanceKm = session.distanceKm;
    const acceptedPoints = [...session.points];

    for (const location of data.locations) {
      const result = filterGpsSample(lastPoint, {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      });

      if (!result.accepted) {
        rejectedPointCount += 1;
        continue;
      }

      acceptedPoints.push(result.point);
      distanceKm += result.distanceKm;
      lastPoint = result.point;
    }

    await saveRunSession({
      ...session,
      points: acceptedPoints,
      distanceKm,
      rejectedPointCount,
      updatedAt: Date.now(),
    });
  },
);
