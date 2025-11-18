import { View, Text, StyleSheet } from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";

export default function StatsOverview({ stats }) {
  if (!stats) return null;

  return (
    <View style={styles.wrapper}>
      
      {/* ROW 1 */}
      <View style={styles.row}>
        
        {/* CUSTOMERS */}
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: "#E3F0FF" }]}>
            <Ionicons name="people" size={22} color="#2563EB" />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.label}>Total Customers</Text>
            <Text style={styles.value}>{stats.totalCustomers}</Text>
          </View>
        </View>

        {/* ACTIVE INVESTMENTS */}
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: "#E7F8EC" }]}>
            <MaterialIcons name="trending-up" size={22} color="#16A34A" />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.label}>Investments</Text>
            <Text style={styles.value}>{stats.activeInvestments}</Text>
          </View>
        </View>
      </View>

      {/* ROW 2 — FULL CARD */}
      <View style={styles.fullCard}>
        <View style={[styles.iconCircle, { backgroundColor: "#EFEAFF" }]}>
          <FontAwesome5 name="university" size={20} color="#6D28D9" />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.label}>Total Deposits</Text>
          <Text style={styles.valueLarge} numberOfLines={1}>
            {stats.totalDeposits}
          </Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 10,
    marginBottom: 20,
    gap: 14,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 18,
    paddingHorizontal: 14,
  },

  fullCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 18,
    paddingHorizontal: 14,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  textBlock: {
    marginLeft: 12,
  },

  label: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 3,
  },

  value: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  valueLarge: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
});
