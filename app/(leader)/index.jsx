import ShareModal from "@/components/leader/ShareModal";
import { useAuth } from "@/context/AuthContext";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// --- COMPONENTS ---

// 1. Primary Highlight Card (Earnings)
const PrimaryStatCard = ({ label, value, secondaryLabel, secondaryValue }) => (
  <View style={styles.primaryCard}>
    <View>
      <Text style={styles.primaryLabel}>{label}</Text>
      <Text style={styles.primaryValue}>
        ₹{(value || 0).toLocaleString("en-IN")}
      </Text>
    </View>
    <View style={styles.primaryDivider} />
    <View style={styles.primaryFooter}>
      <Text style={styles.secondaryLabel}>{secondaryLabel}</Text>
      <Text style={styles.secondaryValue}>
        ₹{(secondaryValue || 0).toLocaleString("en-IN")}
      </Text>
    </View>
    {/* Decorative Circle */}
    <View style={styles.decorativeCircle} />
  </View>
);

// 2. Grid Stat Card
const GridStatCard = ({ icon, label, value, color }) => (
  <View style={styles.gridCard}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
      {icon}
    </View>
    <Text style={styles.gridValue}>{value}</Text>
    <Text style={styles.gridLabel}>{label}</Text>
  </View>
);

// --- MAIN DASHBOARD ---

export default function LeaderDashboard() {
  const { user, axiosAuth } = useAuth();
  const [summary, setSummary] = useState(null);
  const [investmentSummary, setInvestmentSummary] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [dashboardRes, investmentRes, offerRes] = await Promise.all([
        axiosAuth().get(`/leaders/${user.id}/dashboard-summary`),
        axiosAuth().get(`/leaders/${user.id}/investments-summary`),
        axiosAuth().get(`/offer-banners`),
      ]);
      setSummary(dashboardRes.data);
      setInvestmentSummary(investmentRes.data);
      setOffers(offerRes.data || []);
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
              Let's track your growth today.
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Feather name="bell" size={22} color="#333" />
            {/* <View style={styles.badge} /> */}
          </TouchableOpacity>
        </View>

        {/* PRIMARY EARNINGS CARD */}
        <PrimaryStatCard
          label="Total Earnings"
          value={totalCommissionEarned}
          secondaryLabel="Pending Commission"
          secondaryValue={pendingCommissionAmount}
        />

        {/* QUICK ACTIONS / STATS GRID */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview</Text>
        </View>

        <View style={styles.gridContainer}>
          <GridStatCard
            icon={<Feather name="users" size={20} color="#1E6DEB" />}
            label="Customers"
            value={totalCustomersReferred}
            color="#1E6DEB"
          />
          <GridStatCard
            icon={<Feather name="user-check" size={20} color="#10B981" />}
            label="Active Investors"
            value={totalCustomers}
            color="#10B981"
          />
          <GridStatCard
            icon={<Feather name="briefcase" size={20} color="#F59E0B" />}
            label="Investments"
            value={totalInvestments}
            color="#F59E0B"
          />
          <GridStatCard
            icon={<Feather name="trending-up" size={20} color="#8B5CF6" />}
            label="Total Volume"
            value={`₹${(totalInvestmentValue / 1000).toFixed(1)}k`}
            color="#8B5CF6"
          />
        </View>

        {/* OFFERS BANNER */}
        {offers.length > 0 && (
          <View style={styles.bannerContainer}>
            <Image
              source={{
                uri: `https://8xkbnlt0-5050.inc1.devtunnels.ms${offers[currentBanner]?.imageUrl}`,
              }}
              style={styles.bannerImage}
            />
            <View style={styles.bannerOverlay}></View>
          </View>
        )}

        {/* RECENT REFERRALS LIST */}
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Recent Referrals</Text>

            <TouchableOpacity onPress={() => router.push("/customers")}>
              <Text style={styles.viewAllText}>View All</Text>
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
                  onPress={() => router.push(`/customers/${c.id}`)}
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
    backgroundColor: "#1E6DEB", // Brand Blue
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    shadowColor: "#1E6DEB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
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

  // GRID STATS
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  gridCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    // Subtle Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  gridValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  gridLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "500",
  },

  // BANNER
  bannerContainer: {
    height: 160,
    borderRadius: 20,
    overflow: "cover",
    marginBottom: 30,
    backgroundColor: "#eee",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
    padding: 16,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bannerTag: {
    backgroundColor: "rgba(0,0,0,0.6)",
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    overflow: "hidden",
  },
  shareBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 20,
    backdropFilter: "blur(10px)",
  },

  // LIST
  listContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    color: "#1E6DEB",
    fontSize: 14,
    fontWeight: "600",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
  },
  listContent: {
    flex: 1,
  },
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
  statusPending: {
    backgroundColor: "#FEF3C7",
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
