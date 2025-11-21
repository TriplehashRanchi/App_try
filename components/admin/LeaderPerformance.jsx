import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function LeaderPerformance({ customers, investments }) {
  if (!customers?.length) return null;
  const router = useRouter();

  const leaders = {};

  customers.forEach((c) => {
    if (!c.referredByLeaderId) return;

    if (!leaders[c.referredByLeaderId]) {
      leaders[c.referredByLeaderId] = {
        id: c.referredByLeaderId, // ⭐ STORE LEADER ID
        name: c.leaderName,
        customers: 0,
        investmentAmount: 0,
      };
    }

    leaders[c.referredByLeaderId].customers += 1;

    const customerInvestments = investments.filter(
      (inv) => inv.customerId === c.id
    );

    leaders[c.referredByLeaderId].investmentAmount +=
      customerInvestments.reduce((sum, inv) => sum + inv.principalAmount, 0);
  });

  const list = Object.values(leaders);
  if (!list.length) return null;

  return (
    <View style={styles.container}>
      {/* ⭐ Zerodha-style Chip */}
      <View style={styles.chip}>
        <Text style={styles.chipText}>Leader Performance</Text>
      </View>

      {list.map((l, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => router.push(`/leaders/${l.id}`)} // ⭐ FIXED ROUTE
          activeOpacity={0.7}
        >
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <MaterialIcons
                name="workspace-premium"
                size={20}
                color="#2563EB"
              />
            </View>

            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.name}>{l.name}</Text>

              <View style={styles.subRow}>
                <Text style={styles.sub}>Customers: {l.customers}</Text>
                <Text style={styles.total}>
                  ₹{l.investmentAmount.toLocaleString("en-IN")}
                </Text>
              </View>
            </View>
          </View>

          {/* Divider except last item */}
          {i !== list.length - 1 && <View style={styles.divider} />}
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

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEE",
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  name: {
    fontSize: 15,
    fontWeight: "600",
 
  },

  subRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  sub: {
    fontSize: 12,
    color: "#666",
  },

  total: {
    fontSize: 12,
    fontWeight: "700",
    color: "#00C285",
  },
});
