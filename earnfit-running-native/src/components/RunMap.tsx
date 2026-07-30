import { useEffect, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  type LatLng,
} from "react-native-maps";
import type { RunPoint } from "../types/run";

interface RunMapProps {
  points: RunPoint[];
}

const DEFAULT_REGION = {
  latitude: 37.2636,
  longitude: 127.0286,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#171B18" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9BA39D" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#101311" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#303631" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#101A1A" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#20261F" }] },
];

export function RunMap({ points }: RunMapProps) {
  const mapRef = useRef<MapView>(null);
  const coordinates: LatLng[] = points.map(point => ({
    latitude: point.latitude,
    longitude: point.longitude,
  }));
  const latest = coordinates.at(-1);

  // 새 좌표가 들어오면 지도 카메라를 러너 위치로 부드럽게 이동합니다.
  useEffect(() => {
    if (!latest) return;
    mapRef.current?.animateCamera(
      { center: latest, zoom: 17 },
      { duration: 450 },
    );
  }, [latest?.latitude, latest?.longitude]);

  return (
    <View style={styles.frame}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={DEFAULT_REGION}
        customMapStyle={DARK_MAP_STYLE}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        loadingEnabled
      >
        {coordinates.length > 1 && (
          <Polyline
            coordinates={coordinates}
            strokeColor="#CCFF00"
            strokeWidth={6}
            lineCap="round"
            lineJoin="round"
          />
        )}
        {coordinates[0] && (
          <Marker coordinate={coordinates[0]} title="출발점" pinColor="#CCFF00" />
        )}
        {latest && coordinates.length > 1 && (
          <Marker coordinate={latest} title="현재 위치" pinColor="#FFFFFF" />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: 310,
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: "#171B18",
  },
});
