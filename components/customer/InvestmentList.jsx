// components/customer/InvestmentList.jsx
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { calculateInvestmentAnalytics } from "../../utils/financeCalculators";

export default function InvestmentList({ investments }) {
  const router = useRouter();

  if (!investments || investments.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No Investments Yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chip}>
        <Text style={styles.chipText}>My investments</Text>
      </View>

      {investments.map((inv) => {
        const analytics = calculateInvestmentAnalytics(inv);

        return (
          <TouchableOpacity
            key={inv.id}
            style={styles.item}
            onPress={() =>
             router.push(`/investments/${inv.id}`)

            }
          >
            <View>
              <Text style={styles.type}>
                {inv.type === "fd"
                  ? "Fixed Deposit"
                  : inv.type === "fd_plus"
                  ? "FD Plus"
                  : "Recurring Deposit"}
              </Text>

              <Text style={styles.amount}>
                ₹{inv.principalAmount.toLocaleString("en-IN")}
                {inv.type === "rd" ? "/mo" : ""}
              </Text>
            </View>

            <View style={styles.right}>
              <Text style={styles.label}>Value</Text>
              <Text style={styles.value}>
                ₹{analytics.currentValue.toLocaleString("en-IN")}
              </Text>
              <Text
                style={[
                  styles.gain,
                  { color: analytics.totalGain >= 0 ? "#16a34a" : "#dc2626" },
                ]}
              >
                {analytics.totalGain >= 0 ? "+" : ""}
                ₹{analytics.totalGain.toLocaleString("en-IN")}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { marginBottom: 10,
    borderWidth: 1,
borderColor: "#30303028",
borderStyle: "solid",
borderRadius: 10,
padding:20,  // optional but supported on iOS
 },
  heading: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
    color: "#333",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: -10,
    zIndex: 10,
  },
   // 🔵 Zerodha-style chip
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 10,
    zIndex: 10,
    marginTop: -32,
    marginLeft: -7,
  },

  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  type: { fontSize: 15, fontWeight: "600", color: "#222" },
  amount: { fontSize: 13, color: "#777", marginTop: 2 },
  right: { alignItems: "flex-end" },
  label: { fontSize: 11, color: "#888" },
  value: { fontSize: 15, fontWeight: "700", color: "#111" },
  gain: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { color: "#777", fontSize: 16 },
});
