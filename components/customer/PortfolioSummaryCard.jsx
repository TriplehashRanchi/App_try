// components/customer/PortfolioSummaryCard.jsx
import { StyleSheet, Text, View } from "react-native";

export default function PortfolioSummaryCard({ investments }) {
  let invested = 0;
  let current = 0;

  investments.forEach((inv) => {
    invested += inv.analytics?.principalInvested || 0;
    current += inv.analytics?.currentValue || 0;
  });

  const pnl = current - invested;

  return (
    <View style={styles.cardWrapper}>
      {/* 🔵 Zerodha Style Chip */}
      <View style={styles.chip}>
        <Text style={styles.chipText}>Your investments</Text>
      </View>

      {/* MAIN CARD */}
      <View style={styles.card}>
        {/* P&L Row */}
        <View style={styles.row}>
          <Text style={styles.label}>P&L</Text>
          <Text style={[styles.value, { color: pnl >= 0 ? "#00C087" : "#dc2626" }]}>
            ₹{pnl.toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Invested / Current */}
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.smallLabel}>Invested</Text>
            <Text style={styles.bigValue}>₹{invested.toLocaleString("en-IN")}</Text>
          </View>
          <View>
            <Text style={styles.smallLabel}>Current</Text>
            <Text style={styles.bigValue}>₹{current.toLocaleString("en-IN")}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: "100%",
    marginBottom: 22,
  },

  // 🔵 Zerodha-style chip
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    marginBottom: -10,
    zIndex: 10,
    marginLeft: 12,
  },

  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },

  label: {
    fontSize: 14,
    color: "#444",
  },

  smallLabel: {
    fontSize: 13,
    color: "#777",
  },

  value: {
    fontSize: 22,
    fontWeight: "700",
  },

  bigValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
});
