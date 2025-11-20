import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function RecentCustomers({ customers }) {
  if (!customers?.length) return null;
  const router = useRouter();
  const recent = [...customers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return { icon: "checkmark-circle", color: "#059669" };
      case "pending_onboarding":
        return { icon: "time", color: "#D97706" }; // orange
      case "inactive":
      case "blocked":
        return { icon: "close-circle", color: "#DC2626" }; // red
      default:
        return { icon: "help-circle", color: "#6B7280" }; // gray
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.chip}>
        <Text style={styles.chipText}>Recent Customers</Text>
      </View>

      {recent.map((c, index) => {
        const { icon, color } = getStatusIcon(c.status);

        return (
          <TouchableOpacity
            onPress={() => router.push(`customers/${c.id}`)}
            key={index}
            style={[
              styles.row,
              index !== recent.length - 1 && styles.rowBorder,
            ]}
          >
            {/* Avatar */}
            <View style={styles.iconCircle}>
              <Ionicons name="person" size={18} color="#2563EB" />
            </View>

            {/* Name + Email */}
            <View style={styles.info}>
              <Text style={styles.name}>
                {c.firstName} {c.lastName}
              </Text>
              <Text style={styles.email}>{c.email}</Text>
            </View>

            {/* Status Icon */}
            <Ionicons name={icon} size={20} color={color} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
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
    marginBottom: 14,
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },

  email: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
});
