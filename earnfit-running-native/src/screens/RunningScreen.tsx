import { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MetricCard } from "../components/MetricCard";
import { RunMap } from "../components/RunMap";
import { formatDuration, formatPace } from "../domain/locationMath";
import { useRunTracker } from "../hooks/useRunTracker";

const statusLabel = {
  idle: "READY",
  running: "GPS LIVE",
  paused: "PAUSED",
  finished: "FINISHED",
} as const;

export function RunningScreen() {
  const {
    session,
    metrics,
    busy,
    error,
    start,
    pause,
    resume,
    finish,
    reset,
  } = useRunTracker();

  const requestStart = useCallback(() => {
    Alert.alert(
      "백그라운드 위치 권한",
      Platform.OS === "android"
        ? "화면이 꺼져도 경로를 기록하려면 다음 설정 화면에서 위치를 '항상 허용'으로 선택해 주세요."
        : "화면이 꺼져도 경로를 기록하려면 위치 사용을 '항상 허용'해 주세요.",
      [
        { text: "취소", style: "cancel" },
        { text: "계속", onPress: () => void start() },
      ],
    );
  }, [start]);

  const requestFinish = useCallback(() => {
    Alert.alert("러닝을 종료할까요?", "종료 후에는 현재 기록이 저장됩니다.", [
      { text: "계속 달리기", style: "cancel" },
      { text: "종료", style: "destructive", onPress: () => void finish() },
    ]);
  }, [finish]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>EARN EVERY MOVE</Text>
            <Text style={styles.title}>러닝</Text>
          </View>
          <View style={styles.pointPill}>
            <Text style={styles.pointText}>⚡ 2,550 P</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.statusRow}>
            <Text style={styles.liveLabel}>LIVE RUN</Text>
            <View
              style={[
                styles.statusBadge,
                session.status === "running" && styles.statusBadgeLive,
              ]}
            >
              <Text style={styles.statusText}>{statusLabel[session.status]}</Text>
            </View>
          </View>
          <Text style={styles.distance}>{session.distanceKm.toFixed(2)}</Text>
          <Text style={styles.distanceUnit}>KILOMETERS</Text>

          <View style={styles.metrics}>
            <MetricCard value={formatDuration(metrics.durationMs)} label="시간" />
            <MetricCard
              value={formatPace(metrics.paceSecondsPerKm)}
              label="평균 페이스 /km"
            />
            <MetricCard value={String(metrics.calories)} label="소모 kcal" />
          </View>
        </View>

        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <View>
              <Text style={styles.mapTitle}>● 실시간 러닝 맵</Text>
              <Text style={styles.mapCaption}>
                GPS 좌표 {session.points.length}개 · 필터 제외{" "}
                {session.rejectedPointCount}개
              </Text>
            </View>
            <Text style={styles.backgroundBadge}>BACKGROUND ON</Text>
          </View>
          <RunMap points={session.points} />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.controls}>
          {session.status === "idle" && (
            <ActionButton
              label="러닝 시작"
              onPress={requestStart}
              disabled={busy}
              primary
            />
          )}
          {session.status === "running" && (
            <>
              <ActionButton
                label="일시정지"
                onPress={() => void pause()}
                disabled={busy}
              />
              <ActionButton
                label="종료"
                onPress={requestFinish}
                disabled={busy}
                danger
              />
            </>
          )}
          {session.status === "paused" && (
            <>
              <ActionButton
                label="다시 시작"
                onPress={() => void resume()}
                disabled={busy}
                primary
              />
              <ActionButton
                label="종료"
                onPress={requestFinish}
                disabled={busy}
                danger
              />
            </>
          )}
          {session.status === "finished" && (
            <ActionButton
              label="새 러닝 준비"
              onPress={() => void reset()}
              disabled={busy}
              primary
            />
          )}
        </View>

        {busy && <ActivityIndicator color="#CCFF00" style={styles.loader} />}
        <Text style={styles.footnote}>
          GPS 정확도 35m 초과, 3m 미만 흔들림, 30km/h 초과 이동은 자동으로
          거리 계산에서 제외됩니다.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  disabled: boolean;
  primary?: boolean;
  danger?: boolean;
}

function ActionButton({
  label,
  onPress,
  disabled,
  primary,
  danger,
}: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary && styles.primaryButton,
        danger && styles.dangerButton,
        (pressed || disabled) && styles.buttonPressed,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          primary && styles.primaryButtonText,
          danger && styles.dangerButtonText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#070907" },
  screen: { flex: 1, backgroundColor: "#070907" },
  content: { padding: 18, paddingBottom: 42, gap: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
  },
  eyebrow: {
    color: "#CCFF00",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
  },
  title: { marginTop: 5, color: "#FFFFFF", fontSize: 30, fontWeight: "900" },
  pointPill: {
    borderRadius: 999,
    backgroundColor: "#CCFF00",
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  pointText: { color: "#080A08", fontSize: 14, fontWeight: "900" },
  summaryCard: {
    borderWidth: 1,
    borderColor: "#2A302B",
    borderRadius: 28,
    backgroundColor: "#121512",
    padding: 20,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  liveLabel: {
    color: "#727B74",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.8,
  },
  statusBadge: {
    borderWidth: 1,
    borderColor: "#3B433D",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeLive: { borderColor: "#CCFF00", backgroundColor: "#253000" },
  statusText: { color: "#CCFF00", fontSize: 9, fontWeight: "900" },
  distance: {
    marginTop: 6,
    color: "#F5F7F5",
    fontSize: 70,
    fontWeight: "900",
    lineHeight: 76,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  distanceUnit: {
    color: "#879089",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  metrics: { flexDirection: "row", gap: 8, marginTop: 22 },
  mapCard: {
    borderWidth: 1,
    borderColor: "#2A302B",
    borderRadius: 28,
    backgroundColor: "#121512",
    padding: 10,
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 9,
  },
  mapTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  mapCaption: { marginTop: 4, color: "#7B847D", fontSize: 9 },
  backgroundBadge: {
    color: "#CCFF00",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  controls: { flexDirection: "row", gap: 10 },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    borderWidth: 1,
    borderColor: "#414842",
    borderRadius: 17,
    backgroundColor: "#171B18",
  },
  primaryButton: { borderColor: "#CCFF00", backgroundColor: "#CCFF00" },
  dangerButton: { borderColor: "#632E31", backgroundColor: "#2D1719" },
  buttonPressed: { opacity: 0.55, transform: [{ scale: 0.98 }] },
  buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  primaryButtonText: { color: "#090B09" },
  dangerButtonText: { color: "#FF8E94" },
  error: {
    borderRadius: 13,
    backgroundColor: "#32191B",
    color: "#FF9BA0",
    fontSize: 12,
    lineHeight: 18,
    padding: 12,
  },
  loader: { marginTop: -2 },
  footnote: {
    color: "#687169",
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    paddingHorizontal: 12,
  },
});
