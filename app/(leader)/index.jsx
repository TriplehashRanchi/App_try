import ShareModal from "@/components/leader/ShareModal";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OffersCarousel from "../../components/customer/OfferCarousel";
import OverviewStats from "../../components/leader/OverviewStats";
import TargetTracker from "../../components/leader/TargetTracker";

const { width } = Dimensions.get("window");

const PrimaryStatCard = ({ label, value, secondaryLabel, secondaryValue }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push("/(leader)/commissions")}
      style={styles.primaryCard}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text style={styles.primaryLabel}>{label}</Text>
          <Text style={styles.primaryValue}>
            ₹{(value || 0).toLocaleString("en-IN")}
          </Text>
        </View>
        <Ionicons
          name="arrow-forward-circle"
          size={26}
          color="rgba(255,255,255,0.85)"
          style={{ marginLeft: 10, marginTop: -50 }}
        />
      </View>
      <View style={styles.primaryDivider} />
      <View style={styles.primaryFooter}>
        <Text style={styles.secondaryLabel}>{secondaryLabel}</Text>
        <Text style={styles.secondaryValue}>
          ₹{(secondaryValue || 0).toLocaleString("en-IN")}
        </Text>
      </View>
      <View style={styles.decorativeCircle} />
    </TouchableOpacity>
  );
};

// --- MAIN DASHBOARD ---

export default function LeaderDashboard() {
  const { user, axiosAuth } = useAuth();
  const [summary, setSummary] = useState(null);
  const [investmentSummary, setInvestmentSummary] = useState(null);
  const [offers, setOffers] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const targetPromise = axiosAuth()
        .get(`/targets/user/my`)
        .catch((err) => {
          console.log("Leader targets fetch error:", err?.response || err);
          return { data: [] };
        });

      const [dashboardRes, investmentRes, offerRes, targetRes] = await Promise.all([
        axiosAuth().get(`/leaders/${user.id}/dashboard-summary`),
        axiosAuth().get(`/leaders/${user.id}/investments-summary`),
        axiosAuth().get(`/offer-banners`),
        targetPromise,
      ]);
      setSummary(dashboardRes.data);
      setInvestmentSummary(investmentRes.data);
      setOffers(offerRes.data || []);
      setTargets(targetRes?.data || []);
    } catch (e) {
      console.log("Dashboard Error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading)
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1E6DEB" />
      </View>
    );

  if (!summary)
    return <Text style={styles.errorText}>Failed to load data</Text>;

  const {
    totalCustomersReferred,
    totalCommissionEarned,
    pendingCommissionAmount,
    recentReferrals,
  } = summary;

  const {
    totalCustomers = 0,
    totalInvestments = 0,
    totalInvestmentValue = 0,
  } = investmentSummary || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1E6DEB"
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.username?.split(" ")[0] || "Leader"} 👋
            </Text>
            <Text style={styles.subGreeting}>
              Lets track your growth today.
            </Text>
          </View>
          {/* <TouchableOpacity style={styles.notificationBtn}>
            <Feather name="bell" size={22} color="#333" />
            <View style={styles.badge} />
          </TouchableOpacity> */}
        </View>

        {/* ACTIVE TARGETS */}
        {targets?.length ? (
          <View style={styles.targetSection}>
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
                  <View style={styles.targetTopRow}>
                    <Text style={styles.targetLabel}>
                      {t.targetType === "leader" ? "Team Target" : "Customer Target"}
                    </Text>
                    <Text style={[styles.targetStatus, achieved ? styles.statusAchieved : styles.statusPending]}>
                      {achieved ? "Achieved" : "In Progress"}
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
                    <Text style={styles.rewardText}>{t.rewardDescription}</Text>
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
        ) : null}

        {/* PRIMARY EARNINGS CARD */}
        <PrimaryStatCard
          label="Total Earnings"
          value={totalCommissionEarned}
          secondaryLabel="Pending Commission"
          secondaryValue={pendingCommissionAmount}
        />

        {/* QUICK ACTION BUTTONS */}
        {user?.level === "L1" ? (
          // If leader is L1 -> show both buttons
          <View style={styles.quickActionRow}>
            {/* ADD CUSTOMER */}
            <TouchableOpacity
              style={styles.quickBtn}
              activeOpacity={0.85}
              onPress={() => router.push("/(leader)/add-customer")}
            >
              <Ionicons name="person-add-outline" size={18} color="#fff" />
              <Text style={styles.quickBtnText}>Add Customer</Text>
            </TouchableOpacity>

            {/* ADD L2 */}
            <TouchableOpacity
              style={[
                styles.quickBtn,
                { backgroundColor: "#10B981", marginRight: 0 },
              ]}
              activeOpacity={0.85}
              onPress={() => router.push("/(leader)/add-l2")}
            >
              <Ionicons name="people-outline" size={18} color="#fff" />
              <Text style={styles.quickBtnText}>Add L2</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // If leader is NOT L1 -> show only Add Customer (full width)
          <View style={{ marginBottom: 20 }}>
            <TouchableOpacity
              style={[styles.quickBtn, { width: "100%", marginRight: 0 }]}
              activeOpacity={0.85}
              onPress={() => router.push("/(leader)/add-customer")}
            >
              <Ionicons name="person-add-outline" size={18} color="#fff" />
              <Text style={styles.quickBtnText}>Add Customer</Text>
            </TouchableOpacity>
          </View>
        )}

        <TargetTracker refreshTrigger={refreshing} />

        <OverviewStats
          totalCustomersReferred={totalCustomersReferred}
          totalCustomers={totalCustomers}
          totalInvestments={totalInvestments}
          totalInvestmentValue={totalInvestmentValue}
        />

        {/* RECENT REFERRALS LIST */}
        <View style={styles.referralContainer}>
          <View style={styles.referralChip}>
            <Text style={styles.referralChipText}>Recent Referrals</Text>
          </View>
          <View style={styles.listHeaderRow}>
            <Text style={styles.spacer} />
            <TouchableOpacity
              onPress={() => router.push("/(leader)/customers")}
              style={{ flexDirection: "row", alignItems: "center" }}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllMinimal}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#1E6DEB" />
            </TouchableOpacity>
          </View>

          {recentReferrals?.length > 0 ? (
            recentReferrals.map((c, index) => {
              const initials = `${c.firstName?.charAt(0) || ""}${
                c.lastName?.charAt(0) || ""
              }`.toUpperCase();

              // status icons just like main list
              const getStatusIcon = (status) => {
                switch (status) {
                  case "active":
                    return { icon: "checkmark-circle", color: "#10B981" };
                  case "pending_onboarding":
                    return { icon: "time", color: "#F59E0B" };
                  default:
                    return { icon: "close-circle", color: "#EF4444" };
                }
              };

              const { icon, color } = getStatusIcon(c.status);

              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => router.push(`/(leader)/customers/${c.id}`)}
                  activeOpacity={0.7}
                  style={[
                    styles.listItem,
                    index === recentReferrals.length - 1 && {
                      borderBottomWidth: 0,
                    },
                  ]}
                >
                  {/* Avatar */}
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>

                  {/* Info */}
                  <View style={styles.listContent}>
                    <Text style={styles.listTitle}>
                      {c.firstName} {c.lastName}
                    </Text>

                    <Text style={styles.subText}>
                      Joined{" "}
                      {c.activationDate
                        ? new Date(c.activationDate).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                            }
                          )
                        : "Direct"}
                    </Text>
                  </View>

                  {/* ⭐ Status Icon (instead of badge) */}
                  <Ionicons
                    name={icon}
                    size={18}
                    color={color}
                    style={{ marginRight: 6 }}
                  />

                  {/* Arrow */}
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#D1D5DB"
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="person-add-outline" size={28} color="#C7C7C7" />
              <Text style={styles.emptyText}>No referrals yet</Text>
            </View>
          )}
        </View>
        <OffersCarousel />
      </ScrollView>

      <ShareModal
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        url={offers[currentBanner]?.shareUrl}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    marginBottom: -50,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    color: "#EF4444",
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  subGreeting: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  targetSection: {
    marginBottom: 22,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 10,
  },
  targetTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  targetCount: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  targetCard: {
    backgroundColor: "#F8FAFF",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  targetTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  targetLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E40AF",
    letterSpacing: 0.2,
  },
  targetStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "700",
  },
  statusAchieved: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  targetAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  targetMeta: {
    marginTop: 2,
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "600",
  },
  rewardText: {
    marginTop: 8,
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
    backgroundColor: "#1E6DEB",
  },
  progressText: {
    marginTop: 6,
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "700",
  },
  notificationBtn: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  // PRIMARY CARD
  primaryCard: {
    backgroundColor: "#1E6DEB",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#1E6DEB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    position: "relative",
    overflow: "hidden",
  },
  decorativeCircle: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  primaryLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  primaryValue: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "800",
    marginTop: 4,
  },
  primaryDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 16,
  },
  primaryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  secondaryLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  secondaryValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  quickActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: -10,
  },

  quickBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E6DEB",
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: 8,
    flex: 1,
    justifyContent: "center",
    marginRight: 10,
    marginBottom: 12,
  },

  quickBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // LIST

  referralContainer: {
    marginTop: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 15,
    paddingTop: 28,
    backgroundColor: "#FAFAFA",
    position: "relative",
  },

  // Small chip title (Zerodha-style)
  referralChip: {
    position: "absolute",
    top: -14,
    left: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 20,
    elevation: 2,
  },
  referralChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
  },
  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 6,
  },

  spacer: { flex: 1 },

  viewAllMinimal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E6DEB",
    marginRight: 3,
  },

  // Premium header button
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30,109,235,0.08)",
    paddingHorizontal: 14, // increased
    paddingVertical: 7, // increased
    borderRadius: 10,
    marginRight: -2,
    marginLeft: 10,
    marginTop: -50, // push right slightly
  },

  viewAllButtonText: {
    color: "#1E6DEB",
    fontSize: 14,
    fontWeight: "700",
    marginRight: 4,
  },

  listContainer: {
    borderRadius: 10,
    padding: 10,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    color: "#1E6DEB",
    fontSize: 16,
    fontWeight: "600",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: { color: "#4338CA", fontWeight: "700", fontSize: 16 },
  listContent: {
    flex: 1,
  },
  name: { fontSize: 16, fontWeight: "600", color: "#111" },
  subText: { fontSize: 12, color: "#2563EB", marginTop: 2, fontWeight: "600" },
  listTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  listSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: "#DCFCE7",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  statusTextActive: {
    color: "#166534",
  },
  statusTextPending: {
    color: "#B45309",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    color: "#9CA3AF",
    marginTop: 8,
    fontSize: 14,
  },
});
