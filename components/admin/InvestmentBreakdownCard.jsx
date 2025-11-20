import { View, Text, StyleSheet } from "react-native";

export default function InvestmentBreakdownCard({ investments }) {
  if (!investments?.length) return null;

  const fd = investments.filter((i) => i.type === "fd").length;
  const rd = investments.filter((i) => i.type === "rd").length;
  const fdplus = investments.filter((i) => i.type === "fd_plus").length;

  const items = [
    { label: "FD", value: fd },
    { label: "RD", value: rd },
    { label: "FD +", value: fdplus },
  ];

  return (
    <View style={styles.container}>
      {/* Chip */}
      <View style={styles.chip}>
        <Text style={styles.chipText}>Investment Breakdown</Text>
      </View>

      {/* Rows */}
      <View style={styles.row}>
        {items.map((item, idx) => (
          <View key={idx} style={styles.col}>

            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>

            {/* Divider between cols */}
            {idx !== items.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 18,
    marginTop: 10,
  },

  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    marginBottom: 16,
    marginTop: -32,
    zIndex: 10,
  },

  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  col: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    position: "relative",
  },

  value: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 4,
  },

  label: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },

  divider: {
    position: "absolute",
    right: 0,
    top: 10,
    bottom: 10,
    width: 1,
    backgroundColor: "#E5E7EB",
  },
});
