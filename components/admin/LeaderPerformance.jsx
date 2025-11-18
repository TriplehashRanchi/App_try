import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function LeaderPerformance({ customers, investments }) {
  if (!customers?.length) return null;

  const leaders = {};

  customers.forEach(c => {
    if (!c.referredByLeaderId) return;

    if (!leaders[c.referredByLeaderId]) {
      leaders[c.referredByLeaderId] = {
        name: c.leaderName,
        customers: 0,
        investmentAmount: 0,
      };
    }

    leaders[c.referredByLeaderId].customers += 1;

    const customerInvestments = investments.filter(inv => inv.customerId === c.id);
    leaders[c.referredByLeaderId].investmentAmount += customerInvestments.reduce(
      (sum, inv) => sum + inv.principalAmount,
      0
    );
  });

  const list = Object.values(leaders);
  if (!list.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leader Performance</Text>

      {list.map((l, i) => (
        <View key={i} style={styles.row}>
          <MaterialIcons name="person" size={20} color="#2563EB" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.name}>{l.name}</Text>
            <Text style={styles.sub}>
              Customers: {l.customers} | Total: ₹
              {l.investmentAmount.toLocaleString("en-IN")}
            </Text>
          </View>
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
    marginBottom: 12,
    alignItems: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
  },
  sub: {
    fontSize: 12,
    color: "#666",
  },
});
