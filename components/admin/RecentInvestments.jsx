import { View, Text, StyleSheet } from "react-native";

export default function RecentInvestments({ investments }) {
  if (!investments?.length) return null;

  const recent = [...investments]
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    .slice(0, 5);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Investments</Text>

      {recent.map((inv, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.name}>{inv.type}</Text>
          <Text style={styles.amount}>₹{inv.principalAmount.toLocaleString("en-IN")}</Text>
        </View>
      ))}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 18,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  name: {
    fontWeight: "600",
  },
  amount: {
    color: "#333",
    fontWeight: "700",
  },
});
