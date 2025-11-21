"use client";

import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LeaderCustomersPage() {
  const { axiosAuth, user } = useAuth();
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // -----------------------------------------------------------
  // LOAD CUSTOMERS
  // -----------------------------------------------------------
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axiosAuth().get(`/leaders/${user.id}/customers`);
      const data = res.data || [];

      const formatted = data.map((c) => ({
        ...c,
        initials: `${c.firstName[0] || ""}${c.lastName[0] || ""}`.toUpperCase(),
      }));

      setCustomers(formatted);
      setFiltered(formatted);
    } catch (err) {
      console.log("Customer Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // -----------------------------------------------------------
  // SEARCH + FILTER
  // -----------------------------------------------------------
  useEffect(() => {
    let list = [...customers];

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((c) =>
        `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(s)
      );
    }

    if (status !== "all") {
      list = list.filter((c) => c.status === status);
    }

    setFiltered(list);
  }, [search, status, customers]);

  // -----------------------------------------------------------
  // STATUS ICONS
  // -----------------------------------------------------------
  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return { icon: "checkmark-circle", color: "#10B981" };
      case "pending_onboarding":
        return { icon: "time", color: "#F59E0B" };
      default:
        return { icon: "close-circle", color: "#EF4444" };
    }
  };

  // -----------------------------------------------------------
  // LOADING SCREEN
  // -----------------------------------------------------------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // -----------------------------------------------------------
  // MAIN UI
  // -----------------------------------------------------------
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* ---------- HEADER ---------- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Customers</Text>
        <Text style={styles.headerSubtitle}>
          All customers linked to your leader ID.
        </Text>
      </View>

      {/* ---------- SEARCH + FILTER---------- */}
      <View style={styles.searchRow}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search customers..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            style={styles.input}
          />
        </View>

        {/* Filter Button */}
        <TouchableOpacity
          onPress={() => setShowFilters((prev) => !prev)}
          style={styles.filterButton}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={showFilters ? "#2563EB" : "#6B7280"}
          />
        </TouchableOpacity>

        {/* Add Customer */}
        <TouchableOpacity
          onPress={() => router.push("/(leader)/add-customer")}
          style={styles.addButton}
        >
          <Ionicons name="person-add-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ---------- INLINE FILTER CHIPS ---------- */}
      {showFilters && (
        <View style={styles.filterRow}>
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "pending_onboarding", label: "Pending" },
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
        </View>
      )}

      {/* ---------- CUSTOMER LIST ---------- */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 6 }}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        renderItem={({ item }) => {
          const { icon, color } = getStatusIcon(item.status);

          return (
            <TouchableOpacity
              onPress={() => router.push(`/(leader)/customers/${item.id}`)}
              activeOpacity={0.7}
              style={styles.card}
            >
              {/* Avatar */}
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.initials}</Text>
              </View>

              {/* Info */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.name}>
                    {item.firstName} {item.lastName}
                  </Text>
                  <Ionicons
                    name={icon}
                    size={16}
                    color={color}
                    style={{ marginLeft: 6 }}
                  />
                </View>

                <Text style={styles.subText}>
                  Referred by: {item.leaderName || "Direct"}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

// -------------------------------------------------------
// PREMIUM STYLES
// -------------------------------------------------------
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 18,
  },

  header: { paddingVertical: 12 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111" },
  headerSubtitle: { fontSize: 14, color: "#6B7280", marginTop: 2 },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
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

  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#EFF1F5",
    justifyContent: "center",
    alignItems: "center",
  },

  addButton: {
    width: 48,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  filterChip: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },

  filterChipActive: {
    backgroundColor: "#2563EB",
  },

  filterText: { fontSize: 13, color: "#374151", fontWeight: "500" },
  filterTextActive: { color: "#FFF" },

  divider: { height: 1, backgroundColor: "#f0f0f1ff" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: { color: "#4338CA", fontWeight: "700", fontSize: 16 },

  name: { fontSize: 16, fontWeight: "600", color: "#111" },
  subText: { fontSize: 12, color: "#2563EB", marginTop: 2, fontWeight: "600" },
});
