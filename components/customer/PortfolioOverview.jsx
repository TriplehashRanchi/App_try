import { StyleSheet, Text, View } from "react-native";
import { calculateInvestmentAnalytics } from "../../utils/financeCalculators";

export default function PortfolioOverview({ investments = [] }) {
  let totalInvested = 0;
  let currentValue = 0;

  investments.forEach((inv) => {
    const analytics = calculateInvestmentAnalytics(inv);
    totalInvested += analytics.principalInvested || 0;
    currentValue += analytics.currentValue || 0;
  });

  const totalGain = currentValue - totalInvested;
  const gainPercent =
    totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(1) : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Portfolio Overview</Text>

      <View style={styles.row}>
        <View style={styles.box}>
          <Text style={styles.label}>Invested</Text>
          <Text style={styles.value}>₹{totalInvested.toLocaleString("en-IN")}</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.label}>Current Value</Text>
          <Text style={styles.value}>₹{currentValue.toLocaleString("en-IN")}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.box}>
          <Text style={styles.label}>Total Gain</Text>
          <Text
            style={[
              styles.value,
              { color: totalGain >= 0 ? "#16A34A" : "#DC2626" },
            ]}
          >
            {totalGain >= 0 ? "+" : "-"}₹
            {Math.abs(totalGain).toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.label}>Gain %</Text>
          <Text
            style={[
              styles.value,
              { color: totalGain >= 0 ? "#16A34A" : "#DC2626" },
            ]}
          >
            {gainPercent}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 10,
    marginHorizontal: 16,
    padding: 18,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#0F172A",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  box: {
    width: "48%",
  },
  label: {
    fontSize: 13,
    color: "#6B7280",
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
    color: "#111827",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 14,
  },
});
