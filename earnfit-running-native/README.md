# EarnFit Running Native MVP

기존 웹 화면의 러닝 영역을 React Native + TypeScript로 다시 구성한 독립 실행형 MVP입니다. `react-native-maps`로 네이티브 지도를 그리고, `expo-location`과 `expo-task-manager`로 화면이 꺼진 뒤에도 위치를 기록합니다.

## 구현 기능

- GPS 현재 위치 실시간 추적
- Haversine 공식 기반 누적 거리 계산
- 지도 Polyline 경로 표시
- 러닝 시작, 일시정지, 재시작, 종료
- 백그라운드 위치 작업과 Android foreground service
- 정확도, 최소 이동거리, 최대 속도, 가중 평활화를 이용한 GPS 필터
- AsyncStorage 기반 러닝 세션 복구
- 시간, 평균 페이스, 소모 칼로리 표시

## 파일 구조

```text
src/
├─ components/
│  ├─ MetricCard.tsx
│  └─ RunMap.tsx
├─ constants/
│  └─ tracking.ts
├─ domain/
│  ├─ locationFilter.ts
│  └─ locationMath.ts
├─ hooks/
│  └─ useRunTracker.ts
├─ repositories/
│  └─ runSessionRepository.ts
├─ screens/
│  └─ RunningScreen.tsx
├─ services/
│  ├─ backgroundLocationTask.ts
│  └─ locationTrackingService.ts
└─ types/
   └─ run.ts
```

## 실행

Node.js 20.19 이상과 Android Studio 또는 Xcode가 필요합니다.

```bash
pnpm install
pnpm start
```

백그라운드 위치는 Expo Go에서 제한됩니다. 실제 기기 테스트는 개발 빌드를 사용하세요.

```bash
npx eas build --profile development --platform android
# macOS에서는 --platform ios 사용 가능
```

## Google Maps API 키

`.env.example`을 `.env`로 복사하고 키가 준비됐을 때만 값을 입력합니다.

```env
GOOGLE_MAPS_ANDROID_API_KEY=
GOOGLE_MAPS_IOS_API_KEY=
```

- iOS 기본 지도는 MapKit이므로 Google Maps를 선택하지 않으면 키 없이 사용할 수 있습니다.
- Android 독립 빌드는 Google Maps SDK 키가 필요합니다.
- 키 입력 후 네이티브 설정이 달라지므로 개발 빌드를 다시 생성해야 합니다.
- `app.config.ts`가 환경변수를 읽어 `react-native-maps` config plugin에 주입합니다.

## 권한 설정

### Android

`app.config.ts`에 다음 권한이 선언되어 있습니다.

- `ACCESS_COARSE_LOCATION`
- `ACCESS_FINE_LOCATION`
- `ACCESS_BACKGROUND_LOCATION`
- `FOREGROUND_SERVICE`
- `FOREGROUND_SERVICE_LOCATION` — Android 14 이상

Android 11 이상에서는 백그라운드 권한 요청 시 시스템 설정 화면이 열릴 수 있습니다. 앱은 요청 전에 사용 이유를 안내하며, 사용자는 위치를 `항상 허용`으로 선택해야 합니다. 스토어 배포 시 백그라운드 위치와 foreground service 사용 목적을 Play Console 심사 항목에 제출해야 합니다.

### iOS

`app.config.ts`에 다음 항목이 설정되어 있습니다.

- `NSLocationWhenInUseUsageDescription`
- `NSLocationAlwaysAndWhenInUseUsageDescription`
- `UIBackgroundModes: ["location"]`

실제 기기에서 위치 권한을 `항상`으로 허용해야 화면이 꺼진 뒤에도 추적할 수 있습니다. App Store 심사 설명에는 지속 위치 사용 목적을 명확히 기재해야 합니다.

## GPS 필터 기준

필터 값은 `src/constants/tracking.ts`에서 조정합니다.

1. 정확도 반경이 35m보다 큰 좌표 제외
2. 3m 미만 변화는 정지 상태의 GPS 흔들림으로 제외
3. 이전 좌표 대비 30km/h 초과 구간 제외
4. 정확도가 높을수록 새 좌표에 높은 가중치를 주는 평활화 적용
5. 필터를 통과한 좌표만 Haversine 거리와 Polyline에 반영

## 검사

```bash
pnpm typecheck
pnpm test:core
```

## 공식 문서

- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo TaskManager](https://docs.expo.dev/versions/latest/sdk/task-manager/)
- [react-native-maps](https://docs.expo.dev/versions/latest/sdk/map-view/)
- [Expo permissions guide](https://docs.expo.dev/guides/permissions/)
