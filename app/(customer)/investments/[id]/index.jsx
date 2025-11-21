"use client";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from 'react-native-wagmi-charts';
import AddNewInvestmentDrawer from "../../../../components/customer/AddNewInvestmentDrawer";
import RdTimeline from "../../../../components/customer/RdTimeline";
import { useAuth } from "../../../../context/AuthContext";

// Helper function to format dates without dayjs
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}${getDaySuffix(day)} ${month} ${year}`;
};

const getDaySuffix = (day) => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

const getMonthsDiff = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
};

const addMonths = (dateString, months) => {
  const date = new Date(dateString);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
};

// Helper to calculate next payout date
const calculateNextPayout = (investment) => {
  const paidPayouts = investment.payoutHistory?.filter(p => p.status === "paid") || [];
  
  if (paidPayouts.length > 0) {
    // Sort by date descending and get the most recent
    const lastPaid = paidPayouts.sort((a, b) => 
      new Date(b.payoutDate) - new Date(a.payoutDate)
    )[0];
    return formatDate(addMonths(lastPaid.payoutDate, 1));
  }
  
  // First payout is 1 month after activation
  return formatDate(addMonths(investment.activationDate, 1));
};

// Calculate projections based on investment type
const calculateProjections = (investment, tenure) => {
  const data = [];
  const p = investment.principalAmount;
  const rate = investment.interestRate;

  if (investment.type === "fd") {
    // FD: Principal stays same, interest accumulates
    for (let month = 0; month <= tenure; month++) {
      const interestEarned = p * rate * month;
      const value = p + interestEarned;
      data.push({
        timestamp: month,
        value: value,
      });
    }
  } else if (investment.type === "fd_plus") {
    // FD+: 5% principal return + 5% interest monthly
    const monthlyPrincipalReturn = p * 0.05;
    const monthlyInterest = p * 0.05;
    
    for (let month = 0; month <= Math.min(tenure, 20); month++) {
      const principalReturned = monthlyPrincipalReturn * month;
      const interestEarned = monthlyInterest * month;
      const totalReturns = principalReturned + interestEarned;
      
      // Remaining principal + all returns received
      const remainingPrincipal = Math.max(0, p - principalReturned);
      const value = remainingPrincipal + totalReturns;
      
      data.push({
        timestamp: month,
        value: value,
      });
    }
  } else if (investment.type === "rd") {
    // RD: Compound interest on recurring deposits
    const monthlyDeposit = p;
    for (let month = 0; month <= tenure; month++) {
      const totalDeposit = monthlyDeposit * month;
      const interest = monthlyDeposit * rate * (month * (month + 1) / 2);
      data.push({
        timestamp: month,
        value: totalDeposit + interest,
      });
    }
  }

  return data;
};

export default function InvestmentDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { axiosAuth: auth } = useAuth();

  const [investment, setInvestment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTenure, setSelectedTenure] = useState(12);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [withdrawalRequested, setWithdrawalRequested] = useState(false);


  const handleWithdrawalRequest = async () => {
    try {
      await auth().post("/withdrawal-requests", {
        investmentId: investment.id,
        requestedAmount: investment.principalAmount,
      });

      alert("Withdrawal request sent successfully.");
      fetchInvestment();
    } catch (err) {
      console.log("Withdraw error:", err?.response?.data);
      alert("Failed to submit request.");
    }
  };

  const checkExistingWithdrawal = async () => {
  try {
    const res = await auth().get(`/withdrawal-requests/by-investment/${id}`);

    // find request with pending or approved
    const req = res.data.find(
      r => r.status === "pending" || r.status === "approved"
    );

    setWithdrawalRequested(!!req);
  } catch (err) {
    console.log("Failed to check existing withdrawal:", err);
  }
};
  useEffect(() => {
    if (investment) {
      const defaultTenure =
        investment.type === 'fd' ? 12 :
          investment.type === 'fd_plus' ? 20 :
            investment.type === 'rd' ? investment.rdPeriodMonths || 12 : 12;
      setSelectedTenure(defaultTenure);
    }
  }, [investment]);

  useEffect(() => {
    if (!id) return;
    fetchInvestment();
  }, [id]);

const fetchInvestment = async () => {
  setLoading(true);
  try {
    const res = await auth().get(`/investments/${id}`);
    setInvestment(res.data);

    // 🔥 CHECK WITHDRAWAL STATUS HERE
    checkExistingWithdrawal();

  } catch (err) {
    console.log("❌ Fetch error:", err);
    router.push("/customer/dashboard");
  } finally {
    setLoading(false);
  }
};


  const monthsPassed = investment
    ? getMonthsDiff(investment.activationDate, new Date().toISOString())
    : 0;

  const calc = useMemo(() => {
    if (!investment) return {};

    const p = investment.principalAmount;

    if (investment.type === "fd") {
      const monthly = p * investment.interestRate;
      
      // Only count PAID payouts for total received
      const paidPayouts = investment.payoutHistory?.filter(h => h.status === "paid") || [];
      const totalPayouts = paidPayouts.length;
      
      // Total interest earned so far (based on months passed)
      const interestEarned = monthly * monthsPassed;
      
      // Current value = principal + interest earned
      const currentValue = p + interestEarned;
      
      return {
        monthlyPayout: monthly,
        totalReceived: monthly * totalPayouts, // Only paid amounts
        totalInterestEarned: interestEarned, // Total interest accumulated
        currentValue: currentValue,
        principalAmount: p,
        status: monthsPassed >= investment.lockInPeriodMonths ? "Unlocked" : "Locked",
        lockRemaining: Math.max(0, investment.lockInPeriodMonths - monthsPassed),
        nextPayout: calculateNextPayout(investment),
      };
    }

    if (investment.type === "fd_plus") {
      const monthlyPrincipalReturn = p * 0.05;
      const monthlyInterest = p * 0.05;
      const monthlyTotal = monthlyPrincipalReturn + monthlyInterest;
      
      // Only count PAID payouts
      const paidPayouts = investment.payoutHistory?.filter(h => h.status === "paid") || [];
      const monthsCompleted = paidPayouts.length;
      
      const principalReturned = monthlyPrincipalReturn * monthsCompleted;
      const interestEarned = monthlyInterest * monthsCompleted;
      const totalReceived = principalReturned + interestEarned;
      
      // Current value = remaining principal + all returns
      const remainingPrincipal = Math.max(0, p - principalReturned);
      const currentValue = remainingPrincipal + totalReceived;

      return {
        monthlyPayout: monthlyTotal,
        monthsCompleted,
        totalReceived: totalReceived,
        principalReturned: principalReturned,
        interestEarned: interestEarned,
        remainingMonths: 20 - monthsCompleted,
        currentValue: currentValue,
        remainingPrincipal: remainingPrincipal,
        status: monthsCompleted >= 20 ? "Completed" : "Active",
      };
    }

    if (investment.type === "rd") {
      const installment = investment.principalAmount;

      const monthsPaid = investment.installments
        ? investment.installments.filter(i => i.status === "paid").length
        : 0;

      const totalMonths = investment.rdPeriodMonths;
      const totalDeposited = installment * monthsPaid;
      
      // Interest calculation
      const interest = installment * Number(investment.interestRate) * (monthsPaid * (monthsPaid + 1) / 2);
      
      const currentValue = totalDeposited + interest;
      
      // Projected maturity value (full tenure)
      const totalDepositedAtMaturity = installment * totalMonths;
      const interestAtMaturity = installment * Number(investment.interestRate) * (totalMonths * (totalMonths + 1) / 2);
      const maturityValue = totalDepositedAtMaturity + interestAtMaturity;

      return {
        monthlyInstallment: installment,
        monthsPaid,
        totalDeposited,
        interest,
        currentValue: currentValue,
        maturityValue: maturityValue,
        maturityDate: formatDate(addMonths(investment.activationDate, totalMonths)),
      };
    }

    return {};
  }, [investment, monthsPassed]);

  const tenureOptions = useMemo(() => {
    if (!investment) return [];

    if (investment.type === 'fd') {
      return [
        { label: '3M', months: 3 },
        { label: '6M', months: 6 },
        { label: '1Y', months: 12 },
        { label: '3Y', months: 36 },
        { label: '5Y', months: 60 },
        { label: '10Y', months: 120 },
        { label: '20Y', months: 240 },
      ];
    } else if (investment.type === 'fd_plus') {
      return [
        { label: '5M', months: 5 },
        { label: '10M', months: 10 },
        { label: '15M', months: 15 },
        { label: '20M', months: 20 },
      ];
    } else if (investment.type === 'rd') {
      const total = investment.rdPeriodMonths;
      return [
        { label: '25%', months: Math.floor(total * 0.25) },
        { label: '50%', months: Math.floor(total * 0.5) },
        { label: '75%', months: Math.floor(total * 0.75) },
        { label: 'Full', months: total },
      ];
    }
    return [];
  }, [investment]);

  const chartData = useMemo(() => {
    if (!investment) return [];
    return calculateProjections(investment, selectedTenure);
  }, [investment, selectedTenure]);

  if (loading || !investment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loading}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const typeName =
    investment.type === "fd"
      ? "Fixed Deposit"
      : investment.type === "fd_plus"
        ? "FD Plus"
        : "Recurring Deposit";

  // Calculate current value and gain correctly
  const currentValue = calc.currentValue || investment.principalAmount;
  const principalAmount = investment.principalAmount;
  
  // Total gain calculation
  let totalGain = 0;
  if (investment.type === "fd") {
    // Gain = interest earned + payouts received - principal stays invested
    totalGain = calc.totalInterestEarned || 0;
  } else if (investment.type === "fd_plus") {
    // Gain = interest earned (principal is being returned, so gain is only interest portion)
    totalGain = calc.interestEarned || 0;
  } else if (investment.type === "rd") {
    // Gain = current value - total deposited
    totalGain = currentValue - calc.totalDeposited || 0;
  }
  
  const gainPercentage = principalAmount > 0 
    ? ((totalGain / principalAmount) * 100).toFixed(2) 
    : "0.00";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Investment Details</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareIcon}>⤴</Text>
          </TouchableOpacity>
        </View>

        {/* INVESTMENT NAME & BADGES */}
        <View style={styles.titleSection}>
          <View style={styles.logoCircle} />
          <View style={styles.titleTextContainer}>
            <Text style={styles.investmentName} numberOfLines={2}>{typeName}</Text>
            <View style={styles.badgeRow}>
              <Text style={styles.tagText}>
                {investment.type === "rd" ? "Recurring" : "Growth"}
              </Text>
              <Text style={styles.tagSeparator}>|</Text>
              <Text style={styles.tagText}>
                {investment.type === "fd" ? "Fixed Deposit" : investment.type === "fd_plus" ? "FD Plus" : "RD"}
              </Text>
            </View>
          </View>
        </View>

        {/* CURRENT VALUE */}
        <View style={styles.navSection}>
          <Text style={styles.navLabel}>
            Invested on {formatDate(investment.startDate)}
          </Text>
          <View style={styles.navRow}>
            <Text style={styles.navValue}>₹{currentValue.toLocaleString('en-IN')}</Text>
            <Text style={[styles.navChange, totalGain >= 0 && styles.navChangePositive]}>
              {totalGain >= 0 ? '+' : ''}{gainPercentage}%
            </Text>
          </View>
        </View>

        {/* KEY METRICS GRID */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Interest Rate</Text>
            <Text style={styles.metricValue}>
              {(investment.interestRate * 100).toFixed(2)}%
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Status</Text>
            <Text style={styles.metricValue}>
              {investment.status === 'active' ? 'Active' : 'Completed'}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>
              {investment.type === 'fd' ? 'Lock-in period' :
                investment.type === 'rd' ? 'Period' : 'Duration'}
            </Text>
            <Text style={styles.metricValue}>
              {investment.type === 'fd'
                ? investment.lockInPeriodMonths
                  ? `${investment.lockInPeriodMonths} months`
                  : 'NA'
                : investment.type === 'rd'
                  ? `${investment.rdPeriodMonths} months`
                  : '20 months'}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Total Gain</Text>
            <Text style={[styles.metricValue, styles.metricValueGreen]}>
              ₹{totalGain.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* CHART */}
        {chartData.length > 0 && (
          <View style={styles.chartContainer}>
            <View style={styles.chartWrapper}>
              <LineChart.Provider data={chartData}>
                <LineChart height={220} width={Dimensions.get('window').width - 32}>
                  <LineChart.Path color="#387AFF" width={2.5} />
                  <LineChart.CursorCrosshair color="#387AFF">
                    <LineChart.Tooltip />
                  </LineChart.CursorCrosshair>
                </LineChart>
              </LineChart.Provider>
            </View>

            {/* Projection Info */}
            <View style={styles.projectionInfo}>
              <Text style={styles.projectionLabel}>Projected Value</Text>
              <Text style={styles.projectionValue}>
                ₹{chartData[chartData.length - 1]?.value.toLocaleString('en-IN', {
                  maximumFractionDigits: 0
                })}
              </Text>
              <Text style={styles.projectionSubtext}>
                at {selectedTenure} months
              </Text>
            </View>
          </View>
        )}

        {/* LAUNCHED DATE */}
        <View style={styles.launchedSection}>
          <Text style={styles.launchedText}>
            Started on {formatDate(investment.startDate)}
          </Text>
        </View>

        {/* TIME PERIOD TABS */}
        <View style={styles.tabsContainer}>
          {tenureOptions.map((option) => (
            <TouchableOpacity
              key={option.label}
              style={[styles.tab, selectedTenure === option.months && styles.tabActive]}
              onPress={() => setSelectedTenure(option.months)}
            >
              <Text style={[
                styles.tabText,
                selectedTenure === option.months && styles.tabTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DETAILS BASED ON TYPE */}
        {investment.type === "fd" && (
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Principal Amount</Text>
              <Text style={styles.detailValue}>
                ₹{investment.principalAmount.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Current Value</Text>
              <Text style={[styles.detailValue, styles.metricValueGreen]}>
                ₹{calc.currentValue?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Interest Earned</Text>
              <Text style={[styles.detailValue, styles.metricValueGreen]}>
                ₹{calc.totalInterestEarned?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Monthly Payout</Text>
              <Text style={styles.detailValue}>
                ₹{calc.monthlyPayout?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Payouts Received</Text>
              <Text style={styles.detailValue}>
                ₹{calc.totalReceived?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Next Payout</Text>
              <Text style={styles.detailValue}>{calc.nextPayout || 'N/A'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Lock-in Status</Text>
              <Text style={[styles.detailValue, calc.status === "Unlocked" ? styles.statusUnlocked : styles.statusLocked]}>
                {calc.status}
                {calc.lockRemaining > 0 && ` (${calc.lockRemaining} months remaining)`}
              </Text>
            </View>
          </View>
        )}

        {investment.type === "fd_plus" && (
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Principal Amount</Text>
              <Text style={styles.detailValue}>
                ₹{investment.principalAmount.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Current Value</Text>
              <Text style={[styles.detailValue, styles.metricValueGreen]}>
                ₹{calc.currentValue?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Remaining Principal</Text>
              <Text style={styles.detailValue}>
                ₹{calc.remainingPrincipal?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Monthly Return (5%+5%)</Text>
              <Text style={styles.detailValue}>
                ₹{calc.monthlyPayout?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Months Completed</Text>
              <Text style={styles.detailValue}>
                {calc.monthsCompleted || 0} / 20
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Principal Returned</Text>
              <Text style={styles.detailValue}>
                ₹{calc.principalReturned?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Interest Earned</Text>
              <Text style={[styles.detailValue, styles.metricValueGreen]}>
                ₹{calc.interestEarned?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Received</Text>
              <Text style={styles.detailValue}>
                ₹{calc.totalReceived?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Remaining Months</Text>
              <Text style={styles.detailValue}>{calc.remainingMonths || 0}</Text>
            </View>
          </View>
        )}

        {investment.type === "rd" && (
          <View style={styles.detailsSection}>
            <RdTimeline investment={investment} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Monthly Installment</Text>
              <Text style={styles.detailValue}>
                ₹{calc.monthlyInstallment?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Installments Paid</Text>
              <Text style={styles.detailValue}>
                {calc.monthsPaid || 0} / {investment.rdPeriodMonths}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Deposited</Text>
              <Text style={styles.detailValue}>
                ₹{calc.totalDeposited?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Current Value</Text>
              <Text style={[styles.detailValue, styles.metricValueGreen]}>
                ₹{calc.currentValue?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Interest Earned</Text>
              <Text style={[styles.detailValue, styles.statusUnlocked]}>
                ₹{calc.interest?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Maturity Value</Text>
              <Text style={[styles.detailValue, styles.maturityValue]}>
                ₹{calc.maturityValue?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Maturity Date</Text>
              <Text style={styles.detailValue}>{calc.maturityDate || 'N/A'}</Text>
            </View>
          </View>
        )}

        <View style={styles.actionButtons}>
          {/* WITHDRAW BUTTON — Only for FD + unlocked */}
          {investment.type === "fd" && calc.status === "Unlocked" && (
  withdrawalRequested ? (
    <View style={[styles.primaryButton, { backgroundColor: "#d1d5db" }]}>
      <Text style={[styles.primaryButtonText, { color: "#555" }]}>
         Requested
      </Text>
    </View>
  ) : (
    <TouchableOpacity
      style={styles.primaryButton}
      onPress={handleWithdrawalRequest}
    >
      <Text style={styles.primaryButtonText}>Withdraw</Text>
    </TouchableOpacity>
  )
)}


          {/* ADD NEW — always visible */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setDrawerOpen(true)}
          >
            <Text style={styles.secondaryButtonText}>Add New</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
        <AddNewInvestmentDrawer
          visible={drawerOpen}
          onClose={() => setDrawerOpen(false)} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loading: {
    fontSize: 15,
    color: "#666",
  },

  logoCircle: {
    width: 80,
    height: 80,
    marginLeft: -50,
    borderRadius: 40,
    backgroundColor: "#3b5b3dff",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  backIcon: {
    fontSize: 24,
    color: "#222",
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  shareButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  shareIcon: {
    fontSize: 20,
    color: "#222",
  },

  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F6F7F9",
    gap: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  investmentName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#222",
    marginBottom: 3,
  },

  badgeRow: {
    flexDirection: "row",
    alignItems: 'center',
  },

  titleTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  tagSeparator: {
    fontSize: 10,
    color: '#D0D0D0',
    marginHorizontal: 6,
  },

  tagText: {
    fontSize: 12,
    color: '#9E9E9E',
  },

  chartWrapper: {
    height: 220,
    marginHorizontal: 16,
  },

  projectionInfo: {
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: 'center',
  },

  projectionLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },

  projectionValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },

  projectionSubtext: {
    fontSize: 12,
    color: '#666',
  },

  navSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 18,
  },

  navLabel: {
    fontSize: 13,
    color: "#999",
    marginBottom: 6,
  },

  navRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  navValue: {
    fontSize: 28,
    fontWeight: "600",
    color: "#00C285",
    marginRight: 12,
  },

  navChange: {
    fontSize: 14,
    fontWeight: "500",
    color: "#E53E3E",
  },

  navChangePositive: {
    color: "#00C087",
  },

  metricsGrid: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 20, // Changed from 16
    marginTop: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  metricItem: {
    width: "50%",
    marginBottom: 24, // Changed from 20
    paddingRight: 16, // Add padding between columns
  },


  metricLabel: {
    fontSize: 13,
    color: "#999",
    marginBottom: 4,
  },

  metricValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  metricValueGreen: {
    color: "#00C087",
  },

  chartContainer: {
    backgroundColor: "#fff",
    marginTop: 1,
    paddingVertical: 20,
  },

  chartPlaceholder: {
    height: 220, // Increased height to match
    marginHorizontal: 16,
    backgroundColor: "#FAFAFA", // Changed to lighter grey
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  // Remove chartText and chartSubtext content, keep the view empty or add a simple line chart SVG

  chartText: {
    fontSize: 40,
    marginBottom: 8,
  },

  chartSubtext: {
    fontSize: 13,
    color: "#999",
  },

  launchedSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    marginTop: 1,
  },

  launchedText: {
    fontSize: 13,
    color: "#999",
  },

  tabsContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 20, // Changed from 16
    gap: 20, // Increased gap
  },

  tab: {
    paddingVertical: 8, // Increased from 6
    paddingHorizontal: 4,
  },

  tabActive: {
    borderBottomWidth: 3, // Increased from 2
    borderBottomColor: "#387AFF",
  },

  tabText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },

  tabTextActive: {
    color: "#222",
  },

  detailsSection: {
    backgroundColor: "#fff",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },

  detailLabel: {
    fontSize: 14,
    color: "#666",
  },

  detailValue: {
    fontSize: 14,
    color: "#222",
    fontWeight: "500",
  },

  statusUnlocked: {
    color: "#00C087",
  },

  statusLocked: {
    color: "#E53E3E",
  },

  maturityValue: {
    color: "#387AFF",
    fontWeight: "600",
  },

  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: "#387AFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#387AFF",
  },

  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#387AFF",
  },
});