'use client';

import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DashboardHeader from "@/components/customer/DashboardHeader";
import InvestmentList from "@/components/customer/InvestmentList";
import PortfolioSummaryCard from "@/components/customer/PortfolioSummaryCard";
import { useAuth } from "@/context/AuthContext";
import { calculateInvestmentAnalytics } from "@/utils/financeCalculators";
import { registerForPushNotificationsAsync } from "@/utils/notifications";
import OffersCarousel from "../../components/customer/OfferCarousel";

const TargetStrip = ({ targets }) => {
  return (
    <View style={styles.targetStrip}>
      <View style={styles.targetHeader}>
        <Text style={styles.targetTitle}>Your Targets</Text>
        <Text style={styles.targetCount}>{targets.length} active</Text>
      </View>
      {targets.map((t) => {
        const progress = Math.min(t?.progress || 0, 150);
        const remaining = Math.max((t?.targetAmount || 0) - (t?.achievedAmount || 0), 0);
        const achieved = t?.status === "achieved";
        return (
          <View key={t.id} style={styles.targetCard}>
            <View style={styles.targetRow}>
              <Text style={styles.targetType}>
                {t.targetType === "leader" ? "Team Target" : "Personal Target"}
              </Text>
              <Text style={[styles.targetBadge, achieved ? styles.badgeAchieved : styles.badgeProgress]}>
                {achieved ? "Achieved" : "In progress"}
              </Text>
            </View>
            <Text style={styles.targetAmount}>
              ₹{(t.targetAmount || 0).toLocaleString("en-IN")}
            </Text>
            <Text style={styles.targetMeta}>
              {achieved ? "Completed" : `₹${remaining.toLocaleString("en-IN")} to go`}
              {t.daysLeft !== undefined ? ` • ${t.daysLeft} day${t.daysLeft === 1 ? "" : "s"} left` : ""}
            </Text>
            {t.rewardDescription ? (
              <Text style={styles.targetReward}>{t.rewardDescription}</Text>
            ) : null}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress)}% • ₹{(t.achievedAmount || 0).toLocaleString("en-IN")} / ₹
              {(t.targetAmount || 0).toLocaleString("en-IN")}
            </Text>
          </View>
        );
      })}
    </View>
  );
};




export default function DashboardScreen() {
  const { axiosAuth, user } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  registerForPushNotificationsAsync().then((t) => console.log("TOKEN:", t));
}, []);
  
  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, targetsRes] = await Promise.all([
          axiosAuth().get("/customers/dashboard/summary"),
          axiosAuth()
            .get("/targets/user/my")
            .catch((err) => {
              console.log("Customer targets fetch error:", err?.response || err);
              return { data: [] };
            }),
        ]);
        
        // Add analytics to each investment (required for UI)
        const enriched = summaryRes.data.map(inv => ({
          ...inv,
          analytics: calculateInvestmentAnalytics(inv)
        }));

        setInvestments(enriched);
        setTargets(targetsRes?.data || []);
      } catch (err) {
        console.log("DASHBOARD FETCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader user={user} />
        {targets?.length ? (
          <TargetStrip targets={targets} />
        ) : null}
        <PortfolioSummaryCard investments={investments} />
        <InvestmentList investments={investments} />
        <OffersCarousel/>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7F9",
    paddingHorizontal: 16,
  },
  targetStrip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  targetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  targetTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  targetCount: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  targetCard: {
    backgroundColor: "#F8FAFF",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  targetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  targetType: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  targetBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "700",
  },
  badgeAchieved: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },
  badgeProgress: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  targetAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  targetMeta: {
    marginTop: 2,
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "600",
  },
  targetReward: {
    marginTop: 6,
    fontSize: 13,
    color: "#1E3A8A",
    fontWeight: "600",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0A84FF",
  },
  progressText: {
    marginTop: 6,
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "700",
  },
});
