"use client";

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function CustomersListScreen() {
  const { axiosAuth } = useAuth();
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await axiosAuth().get("/customers?limit=9999");
      const data = res.data.data || [];

      const formatted = data.map((c) => ({
        ...c,
        initials: `${c.firstName?.[0] || ""}${
          c.lastName?.[0] || ""
        }`.toUpperCase(),
      }));

      setCustomers(formatted);
      setFiltered(formatted);
    } catch (err) {
      console.log("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Filters
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return { icon: "checkmark-circle", color: "#059669" }; // green
      case "pending_onboarding":
        return { icon: "time", color: "#D97706" }; // amber
      case "inactive":
      case "blocked":
        return { icon: "close-circle", color: "#EF4444" }; // red
      default:
        return { icon: "help-circle", color: "#6B7280" }; // gray
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Customers</Text>
      </View>

      {/* Search Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search customers..."
            value={search}
            onChangeText={setSearch}
            style={styles.input}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Filter Button */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters((prev) => !prev)}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={showFilters ? "#2563EB" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>

      {/* FILTER TABS */}
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

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 6 }}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        renderItem={({ item }) => {
          const { icon, color } = getStatusIcon(item.status);

          return (
            <TouchableOpacity
              onPress={() => router.push(`customers/${item.id}`)}
              style={styles.card}
              activeOpacity={0.6}
            >
              {/* Avatar */}
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.initials}</Text>
              </View>

              {/* Name + Status Icon */}
              <View style={{ flex: 1 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
                >
                  <Text style={styles.name}>
                    {item.firstName} {item.lastName}
                  </Text>

                  {/* ⭐ Status Icon beside name */}
                  <Ionicons name={icon} size={14} color={color} />
                </View>

                <Text style={styles.subText}>
                  Referred by: {item.leaderName ? item.leaderName : "Direct"}
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

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingHorizontal: 18 },

  header: { paddingVertical: 10 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111" },

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

  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  filterChip: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  filterChipActive: { backgroundColor: "#2563EB" },
  filterText: { fontSize: 13, fontWeight: "500", color: "#374151" },
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
