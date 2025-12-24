import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import EventCard from "./EventCard";

export default function LeaderEventsSection() {
  const { axiosAuth } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // ✅ FIX 1: axiosAuth() must be CALLED
        const res = await axiosAuth().get("/events");

        console.log("EVENT API RESPONSE 👉", res.data);

        const rawEvents = res?.data?.data || res?.data || [];
        const today = dayjs().startOf("day");

        const upcoming = rawEvents.filter((e) =>
          dayjs(e.date).isSame(today) || dayjs(e.date).isAfter(today)
        );

        setEvents(upcoming);
      } catch (err) {
        console.log("❌ Events fetch error:", err?.response || err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // ✅ FIX 2: Don’t silently disappear
  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>Upcoming Events</Text>
        </View>
        <Text style={styles.emptyText}>Loading events…</Text>
      </View>
    );
  }

  if (!events.length) {
    return (
      <View style={styles.section}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>Upcoming Events</Text>
        </View>
        <Text style={styles.emptyText}>No upcoming events</Text>
      </View>
    );
  }

  const topEvents = events.slice(0, 2);
  const hasMore = events.length > 2;

  return (
    <View style={styles.section}>
      {/* Floating chip */}
      <View style={styles.chip}>
        <Text style={styles.chipText}>Upcoming Events</Text>
      </View>

      {/* View all */}
      {hasMore && (
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.push("/(leader)/events")}
            style={styles.viewAllBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#1E6DEB" />
          </TouchableOpacity>
        </View>
      )}

      {/* Events */}
      {topEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    paddingTop: 26,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chip: {
    position: "absolute",
    top: -14,
    left: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 20,
    elevation: 2,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  headerRow: {
    alignItems: "flex-end",
    marginBottom: 6,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E6DEB",
    marginRight: 2,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
  },
});
