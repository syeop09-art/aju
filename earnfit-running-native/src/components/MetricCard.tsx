import { StyleSheet, Text, View } from "react-native";

interface MetricCardProps {
  value: string;
  label: string;
}

export function MetricCard({ value, label }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 82,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#0B0E0C",
  },
  value: {
    color: "#F4F7F4",
    fontSize: 20,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  label: {
    marginTop: 8,
    color: "#7D867F",
    fontSize: 10,
    fontWeight: "600",
  },
});
