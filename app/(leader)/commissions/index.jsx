import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- CONSTANTS ---
const BRAND_BLUE = '#0052FF'; // Premium Coinbase/Chase style Blue
const BG_COLOR = '#F4F6F8';   // Very soft grey-blue background

// --- HELPER ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// --- COMPONENT: Simple Premium Card ---
const CommissionCard = ({ item }) => {
  const isPaid = item.status === 'paid';
  
  return (
    <View style={styles.card}>
      <View style={styles.rowTop}>
        <View style={styles.customerContainer}>
            <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                    {item.customerName ? item.customerName.charAt(0).toUpperCase() : 'C'}
                </Text>
            </View>
            <View>
                <Text style={styles.customerName} numberOfLines={1}>
                    {item.customerName || 'Unknown Customer'}
                </Text>
                <Text style={styles.dateText}>
                    {new Date(item.earnedDate).toLocaleDateString('en-IN', { 
                        day: 'numeric', month: 'short', year: 'numeric'
                    })}
                </Text>
            </View>
        </View>

        <View style={styles.amountContainer}>
            <Text style={styles.amountText}>
                {formatCurrency(item.commissionAmount)}
            </Text>
        </View>
      </View>

      {/* Divider Line (Subtle) */}
      <View style={styles.divider} />

      {/* Bottom Row: ID & Status */}
      <View style={styles.rowBottom}>
        <Text style={styles.idText}>ID: #{item.investmentId}</Text>
        
        {/* Minimal Status Badge */}
        <View style={[styles.statusBadge, isPaid ? styles.statusBgPaid : styles.statusBgPending]}>
            <View style={[styles.statusDot, isPaid ? styles.dotPaid : styles.dotPending]} />
            <Text style={[styles.statusText, isPaid ? styles.textPaid : styles.textPending]}>
                {item.status ? item.status.toUpperCase() : 'PENDING'}
            </Text>
        </View>
      </View>
    </View>
  );
};

// --- MAIN SCREEN ---
export default function MyCommissionsPage() {
  const { user, axiosAuth } = useAuth();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCommissions = useCallback(async (pageNumber = 1) => {
    if (!user) return;
    try {
      const res = await axiosAuth().get(`/leaders/${user.id}/commissions`, {
        params: { page: pageNumber, limit: 15 }
      });
      
      setCommissions(res.data.data); 
      setTotalPages(res.data.totalPages);
      setPage(pageNumber);
    } catch (err) {
      console.log("Fetch Error", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, axiosAuth]);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCommissions(1);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFF' }} />
      
      {/* 1. Clean White Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Commissions</Text>
        <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="filter" size={20} color={BRAND_BLUE} />
        </TouchableOpacity>
      </View>

      {/* 2. Content */}
      <View style={styles.contentArea}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={BRAND_BLUE} />
          </View>
        ) : (
          <FlatList
            data={commissions}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={({ item }) => <CommissionCard item={item} />}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BRAND_BLUE]} tintColor={BRAND_BLUE} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIconBg}>
                    <Ionicons name="receipt-outline" size={40} color={BRAND_BLUE} />
                </View>
                <Text style={styles.emptyText}>No commissions yet</Text>
                <Text style={styles.emptySubText}>Your earnings will appear here.</Text>
              </View>
            }
            // Minimal Pagination
            ListFooterComponent={
               totalPages > 1 && (
                 <View style={styles.pagination}>
                   <TouchableOpacity 
                      disabled={page === 1} 
                      onPress={() => fetchCommissions(page - 1)}
                      style={[styles.pageBtn, page === 1 && styles.disabledBtn]}
                   >
                      <Ionicons name="arrow-back" size={20} color="#000" />
                   </TouchableOpacity>
                   
                   <Text style={styles.pageText}>{page} / {totalPages}</Text>

                   <TouchableOpacity 
                      disabled={page === totalPages} 
                      onPress={() => fetchCommissions(page + 1)}
                      style={[styles.pageBtn, page === totalPages && styles.disabledBtn]}
                   >
                      <Ionicons name="arrow-forward" size={20} color="#000" />
                   </TouchableOpacity>
                 </View>
               )
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_COLOR },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800', // Heavy bold for premium feel
    color: '#111',
    letterSpacing: -0.5,
  },
  filterBtn: {
    padding: 8,
    backgroundColor: '#F0F5FF', // Light blue tint
    borderRadius: 19,
  },

  // Content
  contentArea: { flex: 1 },
  listPadding: { padding: 16, paddingBottom: 40 },

  // --- CARD STYLE ---
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10, // Soft, large radius
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F5FF', // Brand Tint
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: BRAND_BLUE,
    fontSize: 18,
    fontWeight: '700',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: BRAND_BLUE, // THE HERO COLOR
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },

  // Bottom Row
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  
  // Status Badges
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBgPaid: { backgroundColor: '#ECFDF5' }, // Very light green
  statusBgPending: { backgroundColor: '#FFFBEB' }, // Very light orange
  
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  dotPaid: { backgroundColor: '#10B981' },
  dotPending: { backgroundColor: '#F59E0B' },

  statusText: { fontSize: 11, fontWeight: '700' },
  textPaid: { color: '#047857' }, // Darker Green for text
  textPending: { color: '#B45309' }, // Darker Orange for text

  // Pagination
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  pageBtn: { padding: 10, backgroundColor: '#FFF', borderRadius: 50, marginHorizontal: 15, elevation: 1, borderWidth: 1, borderColor: '#EEE' },
  disabledBtn: { opacity: 0.3 },
  pageText: { fontSize: 14, fontWeight: '600', color: '#555' },

  // Empty
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F5FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyText: { color: '#111', fontSize: 18, fontWeight: '700' },
  emptySubText: { color: '#9CA3AF', fontSize: 14, marginTop: 4 },
});