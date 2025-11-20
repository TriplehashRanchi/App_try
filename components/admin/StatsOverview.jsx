import { View, Text, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function StatsOverview({ stats }) {
  if (!stats) return null;

  return (
    <View style={styles.container}>

      {/* 🔹 TOP TWO CARDS */}
      <View style={styles.topRow}>
        
        <View style={styles.statCard}>
          <View style={[styles.iconCircle, { backgroundColor: "#E3F0FF" }]}>
            <Ionicons name="people" size={20} color="#2563EB" />
          </View>

          <View style={styles.textCol}>
            <Text style={styles.label}>Customers</Text>
            <Text style={styles.value}>{stats.totalCustomers}</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconCircle, { backgroundColor: "#E7F8EC" }]}>
            <MaterialIcons name="trending-up" size={22} color="#16A34A" />
          </View>

          <View style={styles.textCol}>
            <Text style={styles.label}>Investments</Text>
            <Text style={styles.value}>{stats.activeInvestments}</Text>
          </View>
        </View>

      </View>

      {/* 🔹 DIVIDER */}
      <View style={styles.divider} />

      {/* 🔹 FULL-WIDTH CARD */}
      <View style={styles.bottomCard}>
        <View style={[styles.iconCircle, { backgroundColor: "#EFEAFF" }]}>
          <FontAwesome5 name="university" size={18} color="#6D28D9" />
        </View>

        <View style={styles.textCol}>
          <Text style={styles.label}>Total Deposits</Text>
          <Text style={styles.valueLarge}>{stats.totalDeposits}</Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
  },

  // 🔹 Top section: 2 cards side by side
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    marginRight: 12,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },

  textCol: {
    marginLeft: 12,
  },

  label: {
    fontSize: 13,
    color: "#6B7280",
  },

  value: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#EDEDED",
    marginVertical: 10,
  },

  bottomCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },

  valueLarge: {
    fontSize: 22,
    fontWeight: "700",
    color: "#00C285",
    marginTop: 2,
  },
});
