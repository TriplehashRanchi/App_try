import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
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

dayjs.extend(utc);

// Events are authored in India time. We apply IST's fixed +5:30 offset directly
// (instead of a named timezone) so it works on React Native's Hermes engine,
// which doesn't ship full Intl timezone data. This keeps a June-30 event
// "upcoming" on June 29 regardless of the device's own timezone.
const IST_OFFSET_MINUTES = 330;
const toIST = (date) => dayjs.utc(date).utcOffset(IST_OFFSET_MINUTES);

export default function LeaderEventsSection() {
  const { axiosAuth } = useAuth();

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedEvents, setSelectedEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axiosAuth().get("/events");
        const rawEvents = res?.data?.data || res?.data || [];

        const today = toIST().startOf("day");
        const eventDay = (e) => toIST(e.date).startOf("day");

        // Today's and future events are upcoming.
        const upcoming = rawEvents.filter((e) => !eventDay(e).isBefore(today));

        setUpcomingEvents(upcoming);
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
      const key = toIST(event.date).format("YYYY-MM-DD");
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
