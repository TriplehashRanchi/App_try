import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function InvestmentBreakdownCard({ investments }) {
  if (!investments?.length) return null;

  const fd = investments.filter(i => i.type === "fd").length;
  const rd = investments.filter(i => i.type === "rd").length;
  const fdplus = investments.filter(i => i.type === "fd_plus").length;

  const items = [
    {
      label: "FD",
      value: fd,
      icon: "piggy-bank",
      bg: "#E3F0FF",
      color: "#2563EB",
    },
    {
      label: "RD",
      value: rd,
      icon: "chart-line",
      bg: "#E7F8EC",
      color: "#16A34A",
    },
    {
      label: "FD+",
      value: fdplus,
      icon: "money-bill-wave",
      bg: "#FFF4E6",
      color: "#F59E0B",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Investment Breakdown</Text>

      <View style={styles.row}>
        {items.map((item, idx) => (
          <View key={idx} style={[styles.card, { backgroundColor: item.bg }]}>
           
            <Text style={[styles.value, { color: item.color }]}>
              {item.value}
            </Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
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
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  card: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  value: {
    fontSize: 20,
    fontWeight: "700",
  },

  label: {
    marginTop: 4,
    fontSize: 13,
    color: "#555",
  },
});
