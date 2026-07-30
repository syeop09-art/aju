import type { ConfigContext, ExpoConfig } from "expo/config";

const androidMapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY ?? "";
const iosMapsKey = process.env.GOOGLE_MAPS_IOS_API_KEY ?? "";

export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins: ExpoConfig["plugins"] = [
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "EarnFit은 러닝 중 현재 위치와 이동 경로를 표시하기 위해 위치를 사용합니다.",
        locationAlwaysAndWhenInUsePermission:
          "EarnFit은 화면이 꺼져도 러닝 거리와 경로를 기록하기 위해 위치를 사용합니다.",
        isIosBackgroundLocationEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
        isAndroidForegroundServiceEnabled: true,
      },
    ],
  ];

  // 키가 준비된 뒤 .env에 입력하면 네이티브 빌드에 자동 주입됩니다.
  if (androidMapsKey || iosMapsKey) {
    plugins.push([
      "react-native-maps",
      {
        androidGoogleMapsApiKey: androidMapsKey,
        iosGoogleMapsApiKey: iosMapsKey,
      },
    ]);
  }

  return {
    ...config,
    name: "EarnFit Running",
    slug: "earnfit-running-native",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "dark",
    scheme: "earnfit",
    icon: "./assets/icon.png",
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.earnfit.running",
      infoPlist: {
        UIBackgroundModes: ["location"],
        NSLocationWhenInUseUsageDescription:
          "러닝 중 현재 위치와 이동 경로를 표시하기 위해 위치가 필요합니다.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "화면이 꺼진 뒤에도 러닝 거리와 경로를 계속 기록하기 위해 위치가 필요합니다.",
      },
    },
    android: {
      package: "com.earnfit.running",
      adaptiveIcon: {
        backgroundColor: "#CCFF00",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
    },
    plugins,
    extra: {
      maps: {
        androidKeyConfigured: Boolean(androidMapsKey),
        iosKeyConfigured: Boolean(iosMapsKey),
      },
    },
  };
};
