"use client";

import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

// ✅ All imports MUST be default exports
import DashboardHeader from "@/components/admin/DashboardHeader";
import StatsOverview from "@/components/admin/StatsOverview";
import InvestmentBreakdownCard from "@/components/admin/InvestmentBreakdownCard";
import LeaderPerformance from "@/components/admin/LeaderPerformance";
import RecentCustomers from "@/components/admin/RecentCustomers";
import RecentInvestments from "@/components/admin/RecentInvestments";
import TodaysInvestments from "@/components/admin/TodaysInvestments";

export default function AdminDashboard() {
  const { axiosAuth, user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [generalStats, setGeneralStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [customerRes, investmentRes] = await Promise.all([
          axiosAuth().get("/customers?limit=9999"),
          axiosAuth().get("/investments?limit=9999"),
        ]);

        const customerList = customerRes.data.data;
        const investmentList = investmentRes.data.data;

        // JOIN CUSTOMER NAME WITH INVESTMENT
        const mergedInvestments = investmentList.map((inv) => {
          const c = customerList.find((cust) => cust.id === inv.customerId);
          return {
            ...inv,
            customerName: c ? `${c.firstName} ${c.lastName}` : "Unknown",
          };
        });

        setCustomers(customerList);
        setInvestments(mergedInvestments);

        const totalCustomersCount = customerRes.data.totalCount;
        const activeInvestmentsCount = mergedInvestments.filter(
          (i) => i.status === "active"
        ).length;

        const totalDepositsAmount = mergedInvestments.reduce(
          (acc, inv) => acc + inv.principalAmount,
          0
        );

        setGeneralStats({
          totalCustomers: totalCustomersCount,
          activeInvestments: activeInvestmentsCount,
          totalDeposits: new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(totalDepositsAmount),
        });
      } catch (error) {
        console.log("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <DashboardHeader user={user} />
        <StatsOverview stats={generalStats} />
        <InvestmentBreakdownCard investments={investments} />
        <TodaysInvestments investments={investments} />
        <RecentCustomers customers={customers} />
        <RecentInvestments investments={investments} />
        <LeaderPerformance customers={customers} investments={investments} />
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
});
