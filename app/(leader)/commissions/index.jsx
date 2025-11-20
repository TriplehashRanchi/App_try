import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Components ---

const StatusPill = ({ status }) => {
  const isPaid = status === 'paid';
  return (
    <View style={[
      styles.pill, 
      isPaid ? styles.pillPaid : styles.pillPending
    ]}>
      <Text style={[
        styles.pillText, 
        isPaid ? styles.pillTextPaid : styles.pillTextPending
      ]}>
        {status ? status.toUpperCase() : 'UNKNOWN'}
      </Text>
    </View>
  );
};

const CommissionCard = ({ item }) => (
  <View style={styles.card}>
    {/* Header: Name and Amount */}
    <View style={styles.cardHeader}>
      <View>
        <Text style={styles.customerLabel}>From Customer</Text>
        <Text style={styles.customerName}>{item.customerName || 'Unknown'}</Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={styles.amountText}>
          ₹{item.commissionAmount?.toLocaleString('en-IN') || '0'}
        </Text>
      </View>
    </View>

    {/* Divider */}
    <View style={styles.divider} />

    {/* Details: ID, Date, Status */}
    <View style={styles.cardFooter}>
      <View>
        <Text style={styles.metaLabel}>Invest ID</Text>
        <Text style={styles.metaValue}>#{item.investmentId}</Text>
      </View>
      
      <View>
        <Text style={styles.metaLabel}>Date</Text>
        <Text style={styles.metaValue}>
          {new Date(item.earnedDate).toLocaleDateString('en-IN', { 
            day: '2-digit', month: 'short', year: 'numeric' 
          })}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.metaLabel, { marginBottom: 4 }]}>Status</Text>
        <StatusPill status={item.status} />
      </View>
    </View>
  </View>
);

// --- Main Screen ---

export default function MyCommissionsPage() {
  const { user, axiosAuth } = useAuth();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCommissions = useCallback(async (pageNumber = 1) => {
    if (!user) return;
    try {
      const res = await axiosAuth().get(`/leaders/${user.id}/commissions`, {
        params: { page: pageNumber, limit: 15 } // Matches your web limit
      });
      
      // On mobile, we usually append lists, but to keep logic simple like web, 
      // we will just replace data per page or you can implement infinite scroll later.
      setCommissions(res.data.data); 
      setTotalPages(res.data.totalPages);
      setPage(pageNumber);
    } catch (err) {
      console.log("Commission Fetch Error", err);
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Commissions</Text>
        <Text style={styles.headerSubtitle}>Track your earnings history</Text>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1E6DEB" />
        </View>
      ) : (
        <FlatList
          data={commissions}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => <CommissionCard item={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1E6DEB"]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No commissions earned yet.</Text>
            </View>
          }
          // Simple Pagination Footer
          ListFooterComponent={
             totalPages > 1 && (
               <View style={styles.pagination}>
                 <TouchableOpacity 
                    disabled={page === 1} 
                    onPress={() => fetchCommissions(page - 1)}
                    style={[styles.pageBtn, page === 1 && styles.disabledBtn]}
                 >
                    <Ionicons name="chevron-back" size={20} color={page === 1 ? "#ccc" : "#333"} />
                 </TouchableOpacity>
                 
                 <Text style={styles.pageText}>Page {page} of {totalPages}</Text>

                 <TouchableOpacity 
                    disabled={page === totalPages} 
                    onPress={() => fetchCommissions(page + 1)}
                    style={[styles.pageBtn, page === totalPages && styles.disabledBtn]}
                 >
                    <Ionicons name="chevron-forward" size={20} color={page === totalPages ? "#ccc" : "#333"} />
                 </TouchableOpacity>
               </View>
             )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111' },
  headerSubtitle: { color: '#6b7280', marginTop: 4 },
  listContent: { padding: 16 },
  
  // Card Styles
  card: { 
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customerLabel: { fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' },
  customerName: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginTop: 2 },
  amountContainer: { backgroundColor: '#ecfdf5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  amountText: { color: '#059669', fontWeight: '800', fontSize: 15 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  metaLabel: { fontSize: 11, color: '#9ca3af', marginBottom: 2 },
  metaValue: { fontSize: 13, color: '#374151', fontWeight: '500' },

  // Pill Styles
  pill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  pillPending: { backgroundColor: '#fef9c3' },
  pillPaid: { backgroundColor: '#dcfce7' },
  pillText: { fontSize: 10, fontWeight: '700' },
  pillTextPending: { color: '#854d0e' },
  pillTextPaid: { color: '#166534' },

  // Pagination
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 20 },
  pageBtn: { padding: 10, backgroundColor: '#fff', borderRadius: 8, marginHorizontal: 15, elevation: 1 },
  disabledBtn: { opacity: 0.5 },
  pageText: { fontWeight: '600', color: '#555' },

  // Empty
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#9ca3af', marginTop: 10, fontSize: 16 }
});