"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import dayjs from "dayjs";

export default function MeetingsListPage() {
  const router = useRouter();
  const { axiosAuth } = useAuth();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadMeetings();
  }, [status, search]);

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (status !== "all") params.status = status;

      const res = await axiosAuth().get("/meetings", { params });

      const normalized = res.data.map((m) => ({
        ...m,
        participants:
          typeof m.participants === "string"
            ? safeJSONParse(m.participants)
            : m.participants,
      }));

      setMeetings(normalized);
    } catch (err) {
      console.log("Error loading meetings:", err);
    } finally {
      setLoading(false);
    }
  };

  const safeJSONParse = (val) => {
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  };

  const MeetingRow = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => router.push(`/meeting/${item.id}`)}
        activeOpacity={0.7}
        style={styles.row}
      >
        <View style={styles.iconCircle}>
          <Ionicons
            name={
              item.location_type === "office"
                ? "business-outline"
                : "videocam-outline"
            }
            size={20}
            color="#2563EB"
          />
        </View>

        {/* TEXT BLOCK */}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>{item.title}</Text>

          {/* ⭐ Location with icon */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.sub}>{item.location_details}</Text>
          </View>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.date}>
            {dayjs(item.meeting_date).format("DD MMM")}
          </Text>
          <Text style={styles.time}>
            {dayjs(item.meeting_date).format("hh:mm A")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meetings</Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/meeting/add")}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search + Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search meetings..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowFilters((x) => !x)}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={showFilters ? "#2563EB" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>

      {/* FILTER CHIPS */}
      {/* FILTER CHIPS */}
      {showFilters && (
        <View style={{ marginBottom: 10 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {[
              { key: "all", label: "All" },
              { key: "scheduled", label: "Scheduled" },
              { key: "completed", label: "Completed" },
              { key: "cancelled", label: "Cancelled" },
              { key: "rescheduled", label: "Rescheduled" },
            ].map((f) => (
              <TouchableOpacity
                key={f.key}
                onPress={() => setStatus(f.key)}
                style={[
                  styles.filterChip,
                  status === f.key && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    status === f.key && styles.filterTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* LIST */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : meetings.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Meetings Found</Text>
          <Text style={styles.emptySub}>
            You haven’t added any meetings yet.
          </Text>

          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => router.push("/meeting/add")}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.emptyBtnText}>Add Meeting</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={meetings}
          renderItem={MeetingRow}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingHorizontal: 16 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    marginTop: 10,
  },

  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111" },

  addBtn: {
    backgroundColor: "#387AFF",
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF1F5",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },

  input: { flex: 1, marginLeft: 8, fontSize: 15, color: "#111" },

  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#EFF1F5",
    justifyContent: "center",
    alignItems: "center",
  },

  // ⭐ FILTERS SLIGHTLY SPACED LEFT/RIGHT
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  filterChipActive: { backgroundColor: "#387AFF" },
  filterText: { fontSize: 13, fontWeight: "500", color: "#374151" },
  filterTextActive: { color: "#FFF" },

  divider: { backgroundColor: "#EEE", height: 1 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#E3F0FF",
    justifyContent: "center",
    alignItems: "center",
  },

  title: { fontSize: 15, fontWeight: "700", color: "#111" },

  // ⭐ Location Row with icon
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },

  sub: { fontSize: 12, color: "#666" },

  date: { fontSize: 14, fontWeight: "600", color: "#2563EB" },
  time: { fontSize: 12, color: "#6B7280" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  emptyWrap: {
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginTop: 16,
  },

  emptySub: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },

  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#387AFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 18,
    gap: 6,
  },

  emptyBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  filterScroll: {
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  }, 

  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },

  filterChipActive: {
    backgroundColor: "#387AFF",
  },

  filterText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },

  filterTextActive: {
    color: "#FFF",
  },
});
