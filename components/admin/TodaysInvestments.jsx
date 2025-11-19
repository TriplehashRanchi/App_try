import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function TodaysInvestments({ investments }) {
  if (!investments?.length) return null;
  const router = useRouter();
  const today = new Date().toDateString();

  const todaysList = investments.filter((inv) => {
    const d = new Date(inv.startDate).toDateString();
    return d === today;
  });

  if (!todaysList.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.chip}>
        <Text style={styles.chipText}>Today's Investments</Text>
      </View>
      {todaysList.map((inv, index) => (
        <TouchableOpacity
          key={index}
          activeOpacity={0.7}
          style={[
            styles.row,
            index !== todaysList.length - 1 && styles.rowBorder,
          ]}
          onPress={() => router.push(`/insvestment/${inv.id}`)}
        >
          <View style={styles.iconCircle}>
            <FontAwesome5 name="coins" size={18} color="#2563EB" />
          </View>

          <View style={styles.info}>
            <Text style={styles.type}>
              {inv.type === "fd_plus" ? "FD +" : inv.type.toUpperCase()}
            </Text>
            <Text style={styles.customer}>{inv.customerName}</Text>
          </View>

          <Text style={styles.amount}>
            ₹{inv.principalAmount.toLocaleString("en-IN")}
          </Text>
        </TouchableOpacity>
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
    marginTop: 10,
  },
  // ⭐ Same chip style as your My Investments chip
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    marginBottom: 12,
    marginTop: -32,
    zIndex: 10,
  },

  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
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
    color: "#00C285",
  },
});
