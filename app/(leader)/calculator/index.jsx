  "use client";

  import Slider from "@react-native-community/slider";
import { useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from 'react-native-wagmi-charts';

  const { width } = Dimensions.get('window');

  export default function InvestmentCalculator() {
    const [mode, setMode] = useState("fd"); // fd | rd | fdplus
    const [amount, setAmount] = useState("10000");
    const [months, setMonths] = useState(12);

  const FD_RATE = 0.05;      // 5% monthly payout
  const RD_RATE = 0.24;      // 24% yearly → 2% monthly
  const FDPLUS_PRINCIPAL_RETURN = 0.05;  // 5% monthly principal return
  const FDPLUS_INTEREST = 0.05;          // 5% monthly interest

    // Generate chart data for growth visualization
  const chartData = useMemo(() => {
    const data = [];
    const principal = Number(amount) || 0;

    if (mode === "fd") {
      // FD: Linear growth with monthly payouts
      for (let m = 0; m <= months; m++) {
        const value = principal + (principal * FD_RATE * m);
        data.push({ timestamp: m, value });
      }
    } else if (mode === "rd") {
      // RD: Compound growth
      const monthlyRate = RD_RATE / 12;
      for (let m = 0; m <= months; m++) {
        const totalDeposited = principal * m;
        const interest = (principal * monthlyRate * m * (m + 1)) / 2;
        data.push({ timestamp: m, value: totalDeposited + interest });
      }
    } else if (mode === "fdplus") {
      // FD+: 5% principal + 5% interest = 10% monthly for 20 months = 200% total
      const maxMonths = Math.min(months, 20);
      for (let m = 0; m <= maxMonths; m++) {
        // Each month: 5% of principal returned + 5% interest
        const principalReturned = principal * FDPLUS_PRINCIPAL_RETURN * m;
        const interestEarned = principal * FDPLUS_INTEREST * m;
        const totalReturns = principalReturned + interestEarned;
        // Remaining principal
        const remainingPrincipal = principal - principalReturned;
        // Total value = remaining principal + total returns received
        const value = remainingPrincipal + totalReturns;
        data.push({ timestamp: m, value });
      }
    }

    return data;
  }, [mode, amount, months]);

    // Calculate results
    const calculate = () => {
      const principal = Number(amount) || 0;

      if (mode === "fd") {
        const payoutPerMonth = principal * FD_RATE;
        const totalInterest = payoutPerMonth * months;
        const maturityValue = principal + totalInterest;

        return {
          invested: principal,
          interest: totalInterest,
          total: maturityValue,
          monthlyPayout: payoutPerMonth,
        };
      }

      if (mode === "rd") {
        const monthlyRate = RD_RATE / 12;
        const totalDeposited = principal * months;
        const interestEarned = (principal * monthlyRate * months * (months + 1)) / 2;
        const maturityValue = totalDeposited + interestEarned;

        return {
          invested: totalDeposited,
          interest: interestEarned,
          total: maturityValue,
          monthlyDeposit: principal,
        };
      }

  if (mode === "fdplus") {
    // FD+: 5% principal return + 5% interest monthly for 20 months
    // Month 1-20: Get back 5% principal + 5% interest = 10% of original amount
    // Total: 100% principal returned + 100% interest = 200% (100% gain)
    
    const monthlyPrincipalReturn = principal * FDPLUS_PRINCIPAL_RETURN; // 5%
    const monthlyInterest = principal * FDPLUS_INTEREST; // 5%
    const monthlyTotal = monthlyPrincipalReturn + monthlyInterest; // 10%
    
    const totalPrincipalReturned = monthlyPrincipalReturn * 20; // 100% of principal
    const totalInterest = monthlyInterest * 20; // 100% interest
    const maturityValue = totalPrincipalReturned + totalInterest; // 200% of principal
    
    return {
      invested: principal,
      interest: totalInterest, // 100% of principal
      total: maturityValue, // 200% of principal (2x)
      returns: "100%", // Changed from 200%
      monthlyReturn: monthlyTotal,
      breakdown: {
        principalReturned: totalPrincipalReturned,
        interestEarned: totalInterest,
      }
    };
  }
    };

    const result = calculate();
    const maxMonths = mode === "fdplus" ? 20 : 60;
    const minMonths = mode === "fdplus" ? 20 : 1;

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Investment Calculator</Text>
              <Text style={styles.headerSubtitle}>Plan your investments smartly</Text>
            </View>

            {/* MODE TABS */}
            <View style={styles.tabsCard}>
              <View style={styles.tabs}>
                <TouchableOpacity
                  style={[styles.tab, mode === "fd" && styles.activeTab]}
                  onPress={() => setMode("fd")}
                >
                  <Text style={[styles.tabText, mode === "fd" && styles.activeTabText]}>
                    FD
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tab, mode === "rd" && styles.activeTab]}
                  onPress={() => setMode("rd")}
                >
                  <Text style={[styles.tabText, mode === "rd" && styles.activeTabText]}>
                    RD
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tab, mode === "fdplus" && styles.activeTab]}
                  onPress={() => setMode("fdplus")}
                >
                  <Text style={[styles.tabText, mode === "fdplus" && styles.activeTabText]}>
                    FD Plus
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* INVESTMENT AMOUNT */}
            <View style={styles.card}>
              <Text style={styles.label}>
                {mode === "rd" ? "Monthly Deposit" : "Investment Amount"}
              </Text>
              
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Quick Amount Buttons */}
              <View style={styles.quickAmounts}>
                {[10000, 25000, 50000, 100000].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={styles.quickAmountBtn}
                    onPress={() => setAmount(String(amt))}
                  >
                    <Text style={styles.quickAmountText}>
                      {amt >= 100000 ? `${amt / 1000}K` : `${amt / 1000}K`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* DURATION SLIDER */}
            <View style={styles.card}>
              <View style={styles.sliderHeader}>
                <Text style={styles.label}>Investment Period</Text>
                <Text style={styles.monthsValue}>{months} months</Text>
              </View>

              <Slider
                style={styles.slider}
                minimumValue={minMonths}
                maximumValue={maxMonths}
                minimumTrackTintColor="#387AFF"
                maximumTrackTintColor="#E8E8E8"
                thumbTintColor="#387AFF"
                value={months}
                onValueChange={(v) => setMonths(Math.round(v))}
              />

              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>{minMonths}m</Text>
                <Text style={styles.sliderLabel}>{maxMonths}m</Text>
              </View>

            {mode === "fdplus" && (
    <View style={styles.infoBox}>
      <Text style={styles.infoText}>
        ℹ️ FD Plus returns 10% monthly for 20 months
      </Text>
    </View>
  )}
            </View>

            {/* GROWTH CHART */}
            {chartData.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Growth Projection</Text>
                
                <View style={styles.chartWrapper}>
                  <LineChart.Provider data={chartData}>
                    <LineChart height={200} width={width - 64}>
                      <LineChart.Path color="#387AFF" width={2.5} />
                      <LineChart.CursorCrosshair color="#387AFF">
                        <LineChart.Tooltip 
                          textStyle={styles.tooltipText}
                          style={styles.tooltip}
                        />
                      </LineChart.CursorCrosshair>
                    </LineChart>
                  </LineChart.Provider>
                </View>

                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#387AFF" }]} />
                    <Text style={styles.legendText}>Investment Value</Text>
                  </View>
                </View>
              </View>
            )}

            {/* RESULTS SUMMARY */}
            <View style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>Summary</Text>

              {/* Key Metrics Grid */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>
                    {mode === "rd" ? "Total Deposited" : "Principal Amount"}
                  </Text>
                  <Text style={styles.metricValue}>
                    ₹{result.invested.toLocaleString("en-IN")}
                  </Text>
                </View>

                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Interest Earned</Text>
                  <Text style={[styles.metricValue, styles.interestValue]}>
                    ₹{result.interest.toLocaleString("en-IN")}
                  </Text>
                </View>
              </View>

              {/* Additional Info */}
              {mode === "fd" && (
                <View style={styles.additionalInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Monthly Payout</Text>
                    <Text style={styles.infoValue}>
                      ₹{result.monthlyPayout.toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>
              )}

              {mode === "rd" && (
                <View style={styles.additionalInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Monthly Deposit</Text>
                    <Text style={styles.infoValue}>
                      ₹{result.monthlyDeposit.toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>
              )}

            {mode === "fdplus" && (
    <View style={styles.additionalInfo}>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Monthly Return</Text>
        <Text style={styles.infoValue}>
          ₹{result.monthlyReturn.toLocaleString("en-IN")}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Principal Returned (5%/month)</Text>
        <Text style={styles.infoValue}>
          ₹{result.breakdown.principalReturned.toLocaleString("en-IN")}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Interest Earned (5%/month)</Text>
        <Text style={[styles.infoValue, styles.interestValue]}>
          ₹{result.breakdown.interestEarned.toLocaleString("en-IN")}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Total Gain</Text>
        <Text style={[styles.infoValue, styles.interestValue]}>
          {result.returns}
        </Text>
      </View>
    </View>
  )}

              {/* Maturity Value */}
              <View style={styles.maturityBox}>
                <Text style={styles.maturityLabel}>Maturity Value</Text>
                <Text style={styles.maturityValue}>
                  ₹{result.total.toLocaleString("en-IN")}
                </Text>
              </View>
            </View>

            {/* CTA BUTTON */}
            {/* <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Start Investing</Text>
            </TouchableOpacity> */}

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FAFAFA",
      marginBottom: -50,
    },

    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      backgroundColor: "#fff",
    },

    headerTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: "#222",
      marginBottom: 4,
    },

    headerSubtitle: {
      fontSize: 14,
      color: "#666",
    },

    tabsCard: {
      backgroundColor: "#fff",
      marginTop: 1,
      paddingVertical: 16,
      paddingHorizontal: 20,
    },

    tabs: {
      flexDirection: "row",
      backgroundColor: "#F5F5F5",
      borderRadius: 8,
      padding: 4,
      gap: 4,
    },

    tab: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 6,
      alignItems: "center",
    },

    activeTab: {
      backgroundColor: "#387AFF",
    },

    tabText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#666",
    },

    activeTabText: {
      color: "#fff",
    },

    card: {
      backgroundColor: "#fff",
      marginTop: 12,
      paddingVertical: 20,
      paddingHorizontal: 20,
    },

    label: {
      fontSize: 14,
      fontWeight: "600",
      color: "#666",
      marginBottom: 12,
    },

    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#E8E8E8",
      borderRadius: 8,
      paddingHorizontal: 16,
      backgroundColor: "#FAFAFA",
    },

    currencySymbol: {
      fontSize: 20,
      fontWeight: "600",
      color: "#222",
      marginRight: 8,
    },

    input: {
      flex: 1,
      fontSize: 24,
      fontWeight: "700",
      color: "#222",
      paddingVertical: 16,
    },

    quickAmounts: {
      flexDirection: "row",
      gap: 8,
      marginTop: 12,
    },

    quickAmountBtn: {
      flex: 1,
      backgroundColor: "#F5F5F5",
      paddingVertical: 10,
      borderRadius: 6,
      alignItems: "center",
    },

    quickAmountText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#666",
    },

    sliderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },

    monthsValue: {
      fontSize: 16,
      fontWeight: "700",
      color: "#387AFF",
    },

    slider: {
      width: "100%",
      height: 40,
    },

    sliderLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 4,
    },

    sliderLabel: {
      fontSize: 12,
      color: "#999",
    },

    infoBox: {
      marginTop: 12,
      padding: 12,
      backgroundColor: "#EBF3FF",
      borderRadius: 8,
    },

    infoText: {
      fontSize: 13,
      color: "#387AFF",
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#222",
      marginBottom: 16,
    },

    chartWrapper: {
      height: 200,
    },

    tooltip: {
      backgroundColor: '#222',
      padding: 8,
      borderRadius: 6,
    },

    tooltipText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },

    chartLegend: {
      flexDirection: "row",
      marginTop: 16,
      justifyContent: "center",
    },

    legendItem: {
      flexDirection: "row",
      alignItems: "center",
    },

    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },

    legendText: {
      fontSize: 12,
      color: "#666",
    },

    summaryCard: {
      backgroundColor: "#fff",
      marginTop: 12,
      paddingVertical: 20,
      paddingHorizontal: 20,
    },

    metricsGrid: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },

    metricBox: {
      flex: 1,
      padding: 16,
      backgroundColor: "#FAFAFA",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#F0F0F0",
    },

    metricLabel: {
      fontSize: 12,
      color: "#666",
      marginBottom: 6,
    },

    metricValue: {
      fontSize: 18,
      fontWeight: "700",
      color: "#222",
    },

    interestValue: {
      color: "#00C087",
    },

    additionalInfo: {
      marginBottom: 16,
    },

    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#F5F5F5",
    },

    infoLabel: {
      fontSize: 14,
      color: "#666",
    },

    infoValue: {
      fontSize: 14,
      fontWeight: "600",
      color: "#222",
    },

    maturityBox: {

      padding: 20,
      borderRadius: 12,
      alignItems: "center",
    },

    maturityLabel: {
      fontSize: 13,
      color: "rgba(106, 106, 106, 0.8)",
      marginBottom: 4,
    },

    maturityValue: {
      fontSize: 32,
      fontWeight: "800",
      color: "#64ffacff",
    },

    ctaButton: {
      marginHorizontal: 20,
      marginTop: 20,
      backgroundColor: "#387AFF",
      paddingVertical: 18,
      borderRadius: 8,
      alignItems: "center",
    },

    ctaButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
    },
  });