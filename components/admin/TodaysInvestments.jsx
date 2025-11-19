import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function TodaysInvestments({ investments }) {
  if (!investments?.length) return null;

  const today = new Date().toDateString();

  const todaysList = investments.filter(inv => {
    const d = new Date(inv.startDate).toDateString();
    return d === today;
  });

  if (!todaysList.length) return null; // no new investments today

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today’s Investments</Text>

     {todaysList.map((inv, index) => (
  <View
    key={index}
    style={[
      styles.row,
      index !== todaysList.length - 1 && styles.rowBorder, // ⭐ border only between rows
    ]}
  >
    <View style={styles.iconCircle}>
      <FontAwesome5 name="coins" size={18} color="#2563EB" />
    </View>

    <View style={styles.info}>
      <Text style={styles.type}>{inv.type.toUpperCase()}</Text>
      <Text style={styles.customer}>{inv.customerName}</Text>
    </View>

    <Text style={styles.amount}>
      ₹{inv.principalAmount.toLocaleString("en-IN")}
    </Text>
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
    alignItems: "center",
    paddingVertical: 10,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: "#E3F0FF",
    justifyContent: "center",
    alignItems: "center",
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  type: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },

  customer: {
    fontSize: 12,
    color: "#666",
  },

  amount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
});
