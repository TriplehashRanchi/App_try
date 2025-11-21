import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function UpcomingMeetings({ meetings }) {
  const router = useRouter();

  if (!meetings?.length) return null;

  const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (iso) => {
    const date = new Date(iso);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLocation = (m) => {
    if (m.location_type === "office") return m.location_details || "Office";
    if (m.location_type === "online") return "Online Meeting";
    return m.location_details || "Not specified";
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>Upcoming Meetings</Text>
        </View>
      </View>

      {meetings.map((m, index) => {
        return (
          <TouchableOpacity
            key={m.id}
             onPress={() => router.push(`/meeting/${m.id}`)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.row,
                index !== meetings.length - 1 && styles.rowBorder,
              ]}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name={
                    m.location_type === "office"
                      ? "business-outline"
                      : "videocam-outline"
                  }
                  size={18}
                  color="#2563EB"
                />
              </View>

              <View style={styles.info}>
                <Text style={styles.titleText}>{m.title}</Text>

                {/* ⭐ ADDED LOCATION ICON + TEXT */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 2,
                  }}
                >
                  <Ionicons
                    name="location-outline"
                    size={12}
                    color="#666"
                    style={{ marginRight: 2 }}
                  />
                  <Text style={styles.subText}>{getLocation(m)}</Text>
                </View>
              </View>

              <View style={styles.timeBox}>
                <Text style={styles.date}>{formatDate(m.meeting_date)}</Text>
                <Text style={styles.time}>{formatTime(m.meeting_date)}</Text>
              </View>
            </View>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
  titleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  subText: {
     fontSize: 12,
    color: "#6B7280",
   },
  timeBox: {
    alignItems: "flex-end",
  },
  date: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  time: {
    fontSize: 12,
    color: "#00C285",
  },
});
