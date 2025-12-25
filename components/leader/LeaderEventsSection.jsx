import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import EventCard from "./EventCard";

export default function LeaderEventsSection() {
  const { axiosAuth } = useAuth();

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedEvents, setSelectedEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [completedModalVisible, setCompletedModalVisible] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axiosAuth().get("/events");
        const rawEvents = res?.data?.data || res?.data || [];

        const today = dayjs().startOf("day");

        const upcoming = rawEvents.filter((e) =>
          dayjs(e.date).endOf("day").isAfter(today)
        );

        const completed = rawEvents.filter((e) =>
          dayjs(e.date).endOf("day").isBefore(today)
        );

        setUpcomingEvents(upcoming);
        setCompletedEvents(completed);
      } catch (err) {
        console.log("❌ Events fetch error:", err?.response || err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const groupByDate = (events) => {
    return events.reduce((acc, event) => {
      const key = dayjs(event.date).format("YYYY-MM-DD");
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {});
  };

  const groupedUpcoming = groupByDate(upcomingEvents);
  const topDates = Object.keys(groupedUpcoming).slice(0, 2);

  if (loading) {
    return (
      <View style={styles.section}>
        <Chip title="Upcoming Events" />
        <Text style={styles.emptyText}>Loading events…</Text>
      </View>
    );
  }

  if (!upcomingEvents.length) {
    return (
      <View style={styles.section}>
        <Chip title="Upcoming Events" />
        <Text style={styles.emptyText}>No upcoming events</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.section}>
        <Chip title="Upcoming Events" />

        {/* History Icon */}
        {completedEvents.length > 0 && (
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => setCompletedModalVisible(true)}
              activeOpacity={0.7}
              style={styles.historyBtn}
            >
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.historyText}>Completed</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Upcoming Events */}
        {topDates.map((dateKey) => {
          const dateEvents = groupedUpcoming[dateKey];
          const mainEvent = dateEvents[0];
          const extraCount = dateEvents.length - 1;

          return (
            <TouchableOpacity
              key={dateKey}
              activeOpacity={0.85}
              onPress={() => {
                setSelectedEvents(dateEvents);
                setModalVisible(true);
              }}
            >
              <EventCard event={mainEvent} extraCount={extraCount} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 🔵 UPCOMING EVENTS MODAL */}
      <EventModal
        visible={modalVisible}
        title="Events"
        events={selectedEvents}
        onClose={() => setModalVisible(false)}
      />

      {/* ⚪ COMPLETED EVENTS MODAL */}
      <EventModal
        visible={completedModalVisible}
        title="Completed Events"
        events={completedEvents}
        onClose={() => setCompletedModalVisible(false)}
      />
    </>
  );
}

/* ===================== COMPONENTS ===================== */

const Chip = ({ title }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{title}</Text>
  </View>
);

const EventModal = ({ visible, title, events, onClose }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={22} color="#111827" />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  section: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    paddingTop: 28,
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
    fontWeight: "800",
    color: "#111827",
  },
  headerRow: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  historyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  historyText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 18,
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: "82%",
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
});
