"use client";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../../context/AuthContext";

export default function InvestmentDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { axiosAuth: auth } = useAuth();

  const [investment, setInvestment] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInvestment = useCallback(async () => {
    if (!id || !auth) return;

    setLoading(true);
    try {
      const res = await auth().get(`/investments/${id}`);
      setInvestment(res.data);
    } catch (err) {
      console.log("❌ Fetch error:", err);
      router.push("/customer/dashboard");
    } finally {
      setLoading(false);
    }
  }, [id, auth]);

  useEffect(() => {
    fetchInvestment();
  }, [fetchInvestment]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  if (!investment) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16 }}>No investment found</Text>
      </View>
    );
  }

  const {
    type,
    principalAmount,
    analytics,
    fixedReturnRate,
    fixedReturnMonths,
    payoutHistory
  } = investment;

  return (
    <SafeAreaView>
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.heading}>
        {type === "fd" ? "Fixed Deposit" :
         type === "fd_plus" ? "FD Plus" :
         "Recurring Deposit"}
      </Text>

      {/* Amount Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Invested Amount</Text>
        <Text style={styles.value}>₹{principalAmount.toLocaleString("en-IN")}</Text>

        <Text style={styles.label}>Current Value</Text>
        <Text style={styles.value}>₹{analytics?.currentValue?.toLocaleString("en-IN")}</Text>

        <Text style={styles.label}>Total Gain</Text>
        <Text style={[
          styles.gain,
          { color: analytics?.totalGain >= 0 ? "#16a34a" : "#dc2626" }
        ]}>
          ₹{analytics?.totalGain?.toLocaleString("en-IN")}
        </Text>
      </View>

      {/* FD+ Section */}
      {type === "fd_plus" && (
        <View style={styles.card}>
          <Text style={styles.subHeading}>FD+ Details</Text>
          <Text style={styles.label}>Monthly Return</Text>
          <Text style={styles.value}>{(fixedReturnRate * 100).toFixed(0)}%</Text>

          <Text style={styles.label}>Return Months</Text>
          <Text style={styles.value}>{fixedReturnMonths} months</Text>
        </View>
      )}

      {/* Payout History */}
      <View style={styles.card}>
        <Text style={styles.subHeading}>Payout History</Text>

        {!payoutHistory?.length && (
          <Text style={styles.label}>No payouts yet</Text>
        )}

        {payoutHistory?.map((p) => (
          <View key={p.id} style={styles.payoutRow}>
            <Text style={styles.payoutDate}>{p.payoutDate}</Text>
            <Text style={styles.payoutAmount}>₹{p.amount}</Text>
            <Text style={styles.payoutStatus}>{p.status}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F8FAFC" },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#0F172A",
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  label: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 10,
  },

  value: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
    color: "#0F172A",
  },

  gain: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },

  subHeading: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },

  payoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },

  payoutDate: { color: "#111" },
  payoutAmount: { fontWeight: "700" },
  payoutStatus: { fontSize: 12, color: "#6B7280" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loading: { fontSize: 16, color: "#555" },
});

