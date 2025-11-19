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
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";

export default function InvestmentsListScreen() {
  const { axiosAuth } = useAuth();
  const router = useRouter();

  const [investments, setInvestments] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      setLoading(true);

      const res = await axiosAuth().get(`/investments?page=1&limit=500`);
      const list = res.data?.data || [];

      setInvestments(list);
      setFiltered(list);
    } catch (err) {
      console.log("Investment fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let list = [...investments];

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((i) =>
        `${i.customerName} ${i.type} ${i.customerEmail}`
          .toLowerCase()
          .includes(s)
      );
    }

    if (type !== "all") {
      list = list.filter((i) => i.type === type);
    }

    setFiltered(list);
  }, [search, type, investments]);

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
        <Text style={styles.headerTitle}>Investments</Text>
      </View>

      {/* Search + Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search investments..."
            value={search}
            onChangeText={setSearch}
            style={styles.input}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={showFilters ? "#2563EB" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            {[
              { key: "all", label: "All", color: "#000000" },
              { key: "fd", label: "FD", color: "#10B981" },
              { key: "fd_plus", label: "FD+", color: "#2563EB" },
              { key: "rd", label: "RD", color: "#F59E0B" },
            ].map((f) => {
              const active = type === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setType(f.key)}
                  style={[
                    styles.filterChip,
                    active && { backgroundColor: f.color },
                  ]}
                >
                  <Text
                    style={[styles.filterText, active && { color: "#FFF" }]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingVertical: 6 }}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        renderItem={({ item }) => {
          const interestPercent = (parseFloat(item.interestRate) * 100).toFixed(
            2
          );

          const d = new Date(item.startDate);
          const formattedDate = `${d.getDate().toString().padStart(2, "0")}-${(
            d.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}-${d.getFullYear()}`;

          return (
            <TouchableOpacity
              onPress={() => router.push(`/insvestment/${item.id}`)}
              style={styles.card}
              activeOpacity={0.7}
            >
              {/* Left Badge */}
              <View
                style={[
                  styles.typeBadge,
                  item.type === "fd_plus"
                    ? { backgroundColor: "#2563EB" }
                    : item.type === "fd"
                    ? { backgroundColor: "#10B981" }
                    : { backgroundColor: "#F59E0B" },
                ]}
              >
                <Text style={styles.typeBadgeText}>
                  {item.type === "fd_plus" ? "FD+" : item.type.toUpperCase()}
                </Text>
              </View>

              {/* Main Content */}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.customerName}</Text>

                {/* NEW FORMATTED ROW */}
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 4,
                    flexWrap: "wrap",
                  }}
                >
                  <Text style={styles.subText}>Interest: </Text>

                  <Text style={styles.interestText}>{interestPercent}% </Text>

                  <Text style={styles.subText}>
                    {" "}
                    ₹{item.principalAmount.toLocaleString("en-IN")}
                  </Text>

                  <Text style={styles.dot}> •</Text>

                  <Text style={styles.subText}>{formattedDate}</Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

// ---------------- STYLES ------------------

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 18,
  },

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

  filterContainer: {
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
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

  divider: {
    height: 1,
    backgroundColor: "#ECECEC",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  typeBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  typeBadgeText: { color: "#FFF", fontWeight: "700", fontSize: 14 },

  name: { fontSize: 16, fontWeight: "600", color: "#111" },

 

  interestText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#00C285",
  },

  subText: {
    fontSize: 12,
    color: "#6B7280",
  },

  dot: {
    fontSize: 12,
    color: "#6B7280",
    marginHorizontal: 4,
  },
});
