"use client";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosAuth from "../../utils/axiosAuth";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const customerId = "1263fa59-b87d-408a-8575-33beb8052141"; // ⚠️ Replace later dynamically

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosAuth.get("/customers/1263fa59-b87d-408a-8575-33beb8052141");
      console.log(res.data)
      setProfile(res.data);
    } catch (err) {
      console.log("Profile Error:", err);
    }
  };

  if (!profile) return <Text style={{ padding: 20 }}>Loading...</Text>;

  const initial = profile.firstName?.charAt(0) + profile.lastName?.charAt(0);

  // Mask helpers
  const mask = (value) => `*${value.slice(-4)}`;
  const maskPan = (value) => `*${value.slice(-4).toUpperCase()}`;

  return (
    <SafeAreaView>
    <ScrollView style={styles.container}>
      {/* ⬅️ Back Button */}
      {/* <TouchableOpacity style={{ padding: 10 }} onPress={() => router.back()}>
        <Text style={{ fontSize: 20 }}>←</Text>
      </TouchableOpacity> */}

      {/* 🚀 Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {profile.firstName} {profile.lastName}
          </Text>
          <Text style={styles.userId}>{profile.id.slice(0, 6).toUpperCase()}</Text>
        </View>

        <TouchableOpacity>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Sections */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Password & Security</Text>
        <Text style={styles.actionLink}>Manage</Text>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>E-mail</Text>
        <Text style={styles.boldText}>{profile.email}</Text>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Phone</Text>
        <Text style={styles.boldText}>{mask(profile.phone)}</Text>
      </View>

      {/* Bank Accounts */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Bank accounts</Text>

        {profile.bankAccounts.map((b) => (
          <View key={b.id} style={{ marginBottom: 6 }}>
            <Text style={styles.boldText}>{b.bankName}</Text>
            <Text style={styles.subText}>{mask(b.accountNumber)}</Text>
          </View>
        ))}
      </View>

      {/* PAN */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>PAN</Text>
        <Text style={styles.boldText}>{maskPan(profile.panNumber)}</Text>
      </View>

      {/* Account Closure Section */}
      <View style={styles.closureCard}>
        <Text style={styles.closureTitle}>Account closure</Text>
        <Text style={styles.closureText}>
          Account closure is permanent and irreversible. Please
          <Text style={styles.link}> read this </Text>
          before proceeding.
        </Text>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },

  profileCard: {
    margin: 16,
    padding: 18,
    backgroundColor: "#f7f7f7",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 40,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e3a8a",
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
  },

  userId: {
    fontSize: 14,
    color: "#555",
    marginTop: 3,
  },

  arrow: {
    fontSize: 22,
    color: "#888",
  },

  sectionBlock: {
    marginHorizontal: 16,
    marginVertical: 12,
  },

  sectionTitle: {
    fontSize: 13,
    color: "#999",
    marginBottom: 4,
  },

  boldText: {
    fontSize: 15,
    fontWeight: "600",
  },

  subText: {
    fontSize: 14,
    color: "#444",
  },

  actionLink: {
    fontSize: 15,
    color: "#2563eb",
    fontWeight: "600",
    marginTop: 5,
  },

  closureCard: {
    margin: 16,
    padding: 18,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
  },

  closureTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },

  closureText: {
    fontSize: 14,
    color: "#555",
  },

  link: {
    color: "#2563eb",
    fontWeight: "600",
  },
});
