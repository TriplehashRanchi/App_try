'use client';

import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DashboardHeader from "@/components/customer/DashboardHeader";
import InvestmentList from "@/components/customer/InvestmentList";
import PortfolioSummaryCard from "@/components/customer/PortfolioSummaryCard";
import { useAuth } from "@/context/AuthContext";
import { calculateInvestmentAnalytics } from "@/utils/financeCalculators";
import OffersCarousel from "../../components/customer/OfferCarousel";

export default function DashboardScreen() {
  const { axiosAuth, user } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosAuth().get("/customers/dashboard/summary");
        
        // Add analytics to each investment (required for UI)
        const enriched = res.data.map(inv => ({
          ...inv,
          analytics: calculateInvestmentAnalytics(inv)
        }));

        setInvestments(enriched);
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
  }
});
