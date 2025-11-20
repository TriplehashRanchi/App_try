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

export default function LeadersListScreen() {
  const { axiosAuth } = useAuth();
  const router = useRouter();
  const [leaders, setLeaders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadLeaders();
  }, []);

  // Fetch Leaders
  const loadLeaders = async () => {
    try {
      const res = await axiosAuth().get("/leaders", {
        params: {
          page: 1,
          limit: 9999,
        },
      });

      const data = res.data.data || [];

      const formatted = data.map((l) => ({
        ...l,
        initials: `${l.firstName?.[0] || ""}${
          l.lastName?.[0] || ""
        }`.toUpperCase(),
      }));

      setLeaders(formatted);
      setFiltered(formatted);
    } catch (err) {
      console.log("Leaders Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Apply Filters
  useEffect(() => {
    let list = [...leaders];

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((l) =>
        `${l.firstName} ${l.lastName} ${l.email}`.toLowerCase().includes(s)
      );
    }

    if (level !== "all") {
      list = list.filter((l) => l.level === level);
    }

    setFiltered(list);
  }, [search, level, leaders]);

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
        <Text style={styles.headerTitle}>Leaders</Text>
      </View>

      {/* Search Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search leaders..."
            value={search}
            onChangeText={setSearch}
            style={styles.input}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Filter Icon */}
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
            { key: "L1", label: "L1" },
            { key: "L2", label: "L2" },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setLevel(f.key)}
              style={[
                styles.filterChip,
                level === f.key && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  level === f.key && styles.filterTextActive,
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
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        contentContainerStyle={{ paddingVertical: 6 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`leaders/${item.id}`)}
            style={styles.card}
            activeOpacity={0.7}
          >
            {/* Avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.initials}</Text>
            </View>

            {/* Info */}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {item.firstName} {item.lastName}
              </Text>
               <View style={{ flexDirection: "row", gap: 10 }}>
                <Text style={styles.levelTag}>Level: {item.level}</Text>
               <Text style={styles.levelTag}>Leader code: {item.leaderCode}</Text>
               </View>
            </View>

            {/* Chevron */}
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        )}
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
  subText: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  levelTag: {
    fontSize: 12,
    color: "#2563EB",
    marginTop: 4,
    fontWeight: "600",
  },
});
