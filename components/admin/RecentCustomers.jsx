import { View, Text, StyleSheet } from "react-native";

export default function RecentCustomers({ customers }) {
  if (!customers?.length) return null;

  const recent = [...customers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Customers</Text>

      {recent.map((c, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.name}>{c.firstName} {c.lastName}</Text>
          <Text style={styles.status}>{c.status}</Text>
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
  status: {
    color: "#666",
  },
});
