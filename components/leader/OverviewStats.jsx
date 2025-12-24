import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OverviewStats({
  totalCustomersReferred,
  totalCustomers,
  totalInvestments,
  totalInvestmentValue,
}) {
  const stats = [
    {
      label: "Customers Referred",
      value: totalCustomersReferred,
      icon: <Feather name="users" size={18} color="#1E6DEB" />,
      route: "/(leader)/customers",
    },
    {
      label: "Active Investors",
      value: totalCustomers,
      icon: <Feather name="user-check" size={18} color="#10B981" />,
    },
    {
      label: "Total Investments",
      value: totalInvestments,
      icon: <Feather name="briefcase" size={18} color="#F59E0B" />,
    },
    {
      label: "Total Volume",
      value: `₹${(totalInvestmentValue / 1000).toFixed(1)}k`,
      icon: <Feather name="trending-up" size={18} color="#8B5CF6" />,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.chip}>
        <Text style={styles.chipText}>Overview</Text>
      </View>

      {stats.map((s, i) => {
        const Wrapper = s.route ? TouchableOpacity : View;

        return (
          <Wrapper
            key={i}
            activeOpacity={0.7}
            onPress={() => s.route && router.push(s.route)}
            style={[
              styles.item,
              i === stats.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <View style={styles.left}>
              <View style={styles.icon}>{s.icon}</View>
              <Text style={styles.label}>{s.label}</Text>
            </View>

            <Text style={styles.value}>{s.value}</Text>
          </Wrapper>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: "#30303028",
    borderRadius: 6,
    padding: 15,
    paddingTop: 26,
    backgroundColor: "#FAFAFA",
    position: "relative",
  },

  chip: {
    position: "absolute",
    top: -14,
    left: 14,
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 20,
    elevation: 2,
  },

  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  value: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
  },
});
