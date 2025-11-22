"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import axiosAuth from "../../utils/axiosAuth";

const { width } = Dimensions.get("window");

export default function LeaderProfilePage() {
  const { user,logout } = useAuth();
  const leaderId = user?.id;

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!leaderId) return;
    fetchProfile();
  }, [leaderId]);

  const router = useRouter();

  const fetchProfile = async () => {
    try {
      // ⭐ DO NOT CHANGE — Your API
      const res = await axiosAuth.get(`/leaders/${leaderId}/profile`);
      setProfile(res.data.leader);
    } catch (err) {
      console.log("Leader Profile Error:", err);
    }
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const BASE = process.env.EXPO_PUBLIC_STATIC_URL;

  const initials =
    (profile.firstName?.charAt(0) || "") + (profile.lastName?.charAt(0) || "");

  const mask = (value) => (value ? "••••••" + value.slice(-4) : "N/A");

  const findDoc = (type) =>
    profile.documents?.find((doc) => doc.type === type) || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>

          <Text style={styles.name}>
            {profile.firstName} {profile.lastName}
          </Text>
        </View>

        {/* SUMMARY CARDS */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { marginRight: 8 }]}>
            <Text style={styles.summaryLabel}>Total Referred</Text>
            <Text style={styles.summaryValue}>
              {profile.summary?.totalCustomersReferred || 0}
            </Text>
          </View>

          <View style={[styles.summaryCard, { marginLeft: 8 }]}>
            <Text style={styles.summaryLabel}>Total Commission</Text>
            <Text style={styles.summaryValue}>
              ₹
              {(profile.summary?.totalCommissionEarned || 0).toLocaleString(
                "en-IN"
              )}
            </Text>
          </View>
        </View>

        {/* PERSONAL INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.card}>
            <Divider />
            <InfoRow label="Username" value={profile.email} />
            <Divider />
            <InfoRow label="Primary Role" value={user.primaryRole} />
            <Divider />

            <InfoRow label="Level" value={user.level || profile.level} />
            
            <Divider />
            <InfoRow
              label="Commission Rate"
              value={`${profile.commissionRate * 100}%`}
            />
          </View>
        </View>

        {/* BANK ACCOUNTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Accounts</Text>

          {profile.bankAccounts?.map((bank, i) => (
            <View
              key={bank.id}
              style={[styles.card, i > 0 && { marginTop: 12 }]}
            >
              <View style={styles.bankHeader}>
                <View style={styles.bankIcon}>
                  <Text style={styles.bankIconText}>🏦</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bankName}>{bank.bankName}</Text>
                  <Text style={styles.bankAccount}>
                    {mask(bank.accountNumber)}
                  </Text>
                </View>
              </View>
              <Divider />
              <InfoRow label="IFSC Code" value={bank.ifscCode} />
            </View>
          ))}
        </View>

        {/* DOCUMENTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>

          <View style={styles.documentsGrid}>
            {profile.documents?.map((doc) => (
              <View key={doc.id} style={styles.documentCard}>
                <Image
                  source={{ uri: BASE + doc.fileUrl }}
                  style={styles.documentImage}
                  resizeMode="cover"
                />
                <Text style={styles.documentLabel}>
                  {doc.type?.replace(/_/g, " ").toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* COMMISSION HISTORY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commission History</Text>

          {profile.commissions?.map((com) => (
            <View key={com.id} style={styles.commissionCard}>
              <InfoRow label="Amount" value={`₹ ${com.commissionAmount}`} />
              <Divider />
              <InfoRow label="Status" value={com.status} />
              <Divider />
              <InfoRow label="Investment ID" value={com.investmentId} />
              <Divider />
              <InfoRow
                label="Date"
                value={new Date(com.earnedDate).toLocaleDateString("en-IN")}
              />
            </View>
          ))}
        </View>

          {/* ------------------------------------------------- */}
        {/* ⭐ NEW INVESTMENTS BUTTON ⭐ */}
        {/* ------------------------------------------------- */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <TouchableOpacity
            onPress={() => router.push("/investments")} // 👈 Change this path to your actual route
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              padding: 14,
              backgroundColor: "#387AFF", // Using your blue brand color
              borderRadius: 10,
              marginBottom: 12, // Space between this and Logout
            }}
          >
            <Ionicons name="briefcase-outline" size={22} color="#fff" />
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "600",
                marginLeft: 10,
              }}
            >
              View Investments
            </Text>
          </TouchableOpacity>
          </View>

        <TouchableOpacity
               onPress={logout}
               style={{
                 flexDirection: "row",
                 alignItems: "center",
                 padding: 14,
                 backgroundColor: "#FF3B30",
                 borderRadius: 10,
                 marginTop: 20,
               }}
             >
               <Ionicons name="log-out-outline" size={22} color="#fff" />
               <Text
                 style={{
                   color: "white",
                   fontSize: 16,
                   fontWeight: "600",
                   marginLeft: 10,
                 }}
               >
                 Logout
               </Text>
             </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* --------------------------------------------------------- */
/* UI COMPONENTS */
/* --------------------------------------------------------- */

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

/* --------------------------------------------------------- */
/* STYLES (COPIED EXACTLY FROM CUSTOMER UI) */
/* --------------------------------------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { fontSize: 15, color: "#666" },
  scrollView: { flex: 1 },

  /* HEADER */
  header: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  avatarContainer: { marginBottom: 16 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F4FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "600",
    color: "#387AFF",
  },
  name: {
    fontSize: 22,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDFCF2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00D09C",
    marginRight: 6,
  },
  statusText: { fontSize: 12, fontWeight: "600", color: "#00A881" },

  /* SUMMARY */
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  summaryLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  summaryValue: { fontSize: 20, fontWeight: "600", color: "#222" },

  /* SECTIONS */
  section: { paddingHorizontal: 16, marginTop: 12 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    marginBottom: 12,
    textTransform: "uppercase",
  },

  /* CARD */
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },

  /* INFO ROW */
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  infoLabel: { fontSize: 14, color: "#666" },
  infoValue: { fontSize: 14, fontWeight: "500", color: "#111" },

  divider: { height: 1, backgroundColor: "#EEE" },

  /* BANK */
  bankHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
  },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bankIconText: { fontSize: 20 },
  bankName: { fontSize: 15, fontWeight: "700", color: "#222" },
  bankAccount: { fontSize: 13, color: "#777" },

  /* DOCUMENTS */
  documentsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  documentCard: {
    width: (width - 44) / 2,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  documentImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#F8F9FA",
  },
  documentLabel: {
    fontSize: 11,
    color: "#666",
    padding: 10,
    fontWeight: "500",
    textAlign: "center",
  },

  /* COMMISSION */
  commissionCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 12,
  },
});
