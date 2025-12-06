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
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import axiosAuth from "../../utils/axiosAuth";

const { width } = Dimensions.get('window');

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  
  // 1. Get the 'user' object from context
  const { user, logout } = useAuth();

  useEffect(() => {
    // 2. Only fetch if user exists
    if (user?.id) {
      fetchProfile();
    }
  }, [user]); // Run whenever user changes

  const fetchProfile = async () => {
    try {
      // 3. Dynamic URL using user.id
      const res = await axiosAuth.get(`/customers/${user.id}`);
      setProfile(res.data);
    } catch (err) {
      console.log("Profile Error:", err);
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

  const initial =
    (profile.firstName?.charAt(0) || "") +
    (profile.lastName?.charAt(0) || "");

  const maskFull = (value) => {
    if (!value) return "N/A";
    return "••••••" + value.slice(-4);
  };

  const maskPan = (value) => {
    if (!value) return "N/A";
    return "••••••" + value.slice(-4).toUpperCase();
  };

  const BASE = "https://api.rmclub.co";

  // Calculate total investment
  const totalInvestment = profile.investments?.reduce(
    (sum, inv) => sum + (inv.principalAmount || 0),
    0
  ) || 0;

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
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </View>
          
          <Text style={styles.name}>
            {profile.firstName} {profile.lastName}
          </Text>
          
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{profile.status ? profile.status.toUpperCase() : 'ACTIVE'}</Text>
          </View>
        </View>

        {/* INVESTMENT SUMMARY CARDS */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { marginRight: 8 }]}>
            <Text style={styles.summaryLabel}>Total Invested</Text>
            <Text style={styles.summaryValue}>
              ₹{totalInvestment.toLocaleString('en-IN')}
            </Text>
          </View>
          
          <View style={[styles.summaryCard, { marginLeft: 8 }]}>
            <Text style={styles.summaryLabel}>Active Plans</Text>
            <Text style={styles.summaryValue}>
              {profile.investments?.filter(i => i.status === 'active').length || 0}
            </Text>
          </View>
        </View>

        {/* PERSONAL INFORMATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.card}>
            <InfoRow label="Email" value={profile.email} />
            <Divider />
            <InfoRow label="Phone" value={maskFull(profile.phone)} />
            <Divider />
            <InfoRow label="Address" value={profile.address} />
            <Divider />
            <InfoRow label="Username" value={profile.username} />
          </View>
        </View>

        {/* KYC DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KYC Details</Text>
          
          <View style={styles.card}>
            <InfoRow label="Aadhar Number" value={maskFull(profile.aadharNumber)} />
            <Divider />
            <InfoRow label="PAN Number" value={maskPan(profile.panNumber)} />
          </View>
        </View>

        {/* BANK ACCOUNTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Accounts</Text>
          
          {profile.bankAccounts?.length > 0 ? (
            profile.bankAccounts.map((bank, index) => (
              <View key={bank.id} style={[styles.card, index > 0 && { marginTop: 12 }]}>
                <View style={styles.bankHeader}>
                  <View style={styles.bankIcon}>
                    <Text style={styles.bankIconText}>🏦</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bankName}>{bank.bankName}</Text>
                    <Text style={styles.bankAccount}>{maskFull(bank.accountNumber)}</Text>
                  </View>
                </View>
                <Divider />
                <InfoRow label="IFSC Code" value={bank.ifscCode} />
              </View>
            ))
          ) : (
            <Text style={{color: '#999', fontStyle: 'italic'}}>No bank accounts found.</Text>
          )}
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
                  {doc.type ? doc.type.replace(/_/g, ' ').toUpperCase() : 'DOCUMENT'}
                </Text>
              </View>
            ))}
            {(!profile.documents || profile.documents.length === 0) && (
               <Text style={{color: '#999', fontStyle: 'italic', width: '100%'}}>No documents uploaded.</Text>
            )}
          </View>
        </View>

        {/* ACCOUNT CLOSURE */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerCard}>
            <Text style={styles.dangerTitle}>Close Account</Text>
            <Text style={styles.dangerText}>
              Permanently delete your account and all associated data
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={logout}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
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
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    marginBottom: -50,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    fontSize: 15,
    color: "#666",
  },

  scrollView: {
    flex: 1,
  },

  header: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },

  avatarContainer: {
    marginBottom: 16,
  },

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

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#00A881",
  },

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

  summaryLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },

  summaryValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
  },

  section: {
    paddingHorizontal: 16,
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
  },

  infoLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },

  infoValue: {
    fontSize: 14,
    color: "#222",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },

  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },

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

  bankIconText: {
    fontSize: 20,
  },

  bankName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    marginBottom: 2,
  },

  bankAccount: {
    fontSize: 13,
    color: "#666",
  },

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
  },

  dangerCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFE5E5",
  },

  dangerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E53E3E",
    marginBottom: 4,
  },

  dangerText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
});