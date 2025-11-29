import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TwoActionButtons({
  targetRoute = "/(admin)/targets",
  meetingRoute = "/(admin)/meetings",
}) {
  return (
    <View style={styles.row}>

      {/* TARGETS BUTTON */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.card, { backgroundColor: "#2563EB" }]}
        onPress={() => router.push(targetRoute)}
      >
        <View style={[styles.iconWrap, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
          <Ionicons name="flag-outline" size={22} color="#fff" />
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title}>Targets</Text>
          <Text style={styles.subtitle}>View goals</Text>
        </View>

        {/* <Ionicons name="chevron-forward" size={18} color="#fff" /> */}
      </TouchableOpacity>

      {/* MEETINGS BUTTON */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.card, { backgroundColor: "#7C3AED" }]}
        onPress={() => router.push(meetingRoute)}
      >
        <View style={[styles.iconWrap, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
          <Ionicons name="people-outline" size={22} color="#fff" />
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title}>Meetings</Text>
          <Text style={styles.subtitle}>Scheduled calls</Text>
        </View>

        {/* <Ionicons name="chevron-forward" size={18} color="#fff" /> */}
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 20,
    gap: 10,
  },

  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,

    // Premium shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },

  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  textWrap: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },

  subtitle: {
    fontSize: 12,
    marginTop: 2,
    color: "rgba(255,255,255,0.85)",
  },
});
