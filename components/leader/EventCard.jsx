import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { StyleSheet, Text, View } from "react-native";

export default function EventCard({ event, extraCount = 0 }) {
  const date = dayjs(event.date);

  return (
    <View style={styles.card}>
      {/* Date Block */}
      <View style={styles.dateBlock}>
        <Text style={styles.month}>{date.format("MMM")}</Text>
        <Text style={styles.day}>{date.format("DD")}</Text>
        <Text style={styles.weekday}>{date.format("ddd")}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>

        <Text style={styles.description} numberOfLines={2}>
          {event.description || "An exclusive RM Club event you shouldn’t miss."}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.metaText}>{event.time}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.metaText}>{event.venue}</Text>
        </View>
      </View>

      {/* +N Badge */}
      {extraCount > 0 && (
        <View style={styles.multiBadge}>
          <Text style={styles.multiText}>+{extraCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
  },
  dateBlock: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#1E6DEB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  month: {
    color: "#E0E7FF",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  day: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 24,
  },
  weekday: {
    color: "#E0E7FF",
    fontSize: 11,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  description: {
    fontSize: 13,
    color: "#6B7280",
    marginVertical: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },

  /* +N Badge */
  multiBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#1E6DEB",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  multiText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
