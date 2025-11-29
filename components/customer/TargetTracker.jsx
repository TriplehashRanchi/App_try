import { useAuth } from '@/context/AuthContext';
import { CalendarClock, Target } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- Helpers ---
const formatAmount = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const getTimeLeftCopy = (daysLeft, status) => {
    if (daysLeft === 0) return status === 'achieved' ? 'Achieved' : 'Ends today';
    if (daysLeft < 0) return 'Expired';
    return `${daysLeft}d left`;
};

// --- Compact Target Card ---
const TargetCard = ({ item }) => {
    const progressValue = Math.min(Number(item.progress || 0), 100);
    const toGo = Math.max(Number(item.targetAmount || 0) - Number(item.achievedAmount || 0), 0);
    const achieved = item.status === 'achieved' || item.isAchieved;

    return (
        <View style={styles.card}>
            {/* Row 1: Header & Amount */}
            <View style={styles.cardTopRow}>
                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Target size={12} color="#2563EB" />
                        <Text style={styles.typeText}>
                            {item.targetType === 'leader' ? 'TEAM GOAL' : 'MY GOAL'}
                        </Text>
                    </View>
                    <Text style={styles.amountText}>{formatAmount(item.targetAmount)}</Text>
                </View>
                
                {/* Status Badge */}
                <View style={[styles.statusBadge, achieved ? styles.bgGreen : styles.bgSlate]}>
                    <Text style={[styles.statusText, achieved ? styles.textGreen : styles.textSlate]}>
                        {achieved ? 'Achieved' : 'Active'}
                    </Text>
                </View>
            </View>

            {/* Row 2: Progress Bar */}
            <View style={{ marginTop: 8, marginBottom: 8 }}>
                <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>
                        {Math.round(progressValue)}% ({formatAmount(item.achievedAmount)})
                    </Text>
                    {!achieved && (
                        <Text style={styles.toGoText}>{formatAmount(toGo)} to go</Text>
                    )}
                </View>
                <View style={styles.progressBarTrack}>
                    <View 
                        style={[
                            styles.progressBarFill, 
                            { width: `${progressValue}%`, backgroundColor: achieved ? '#10B981' : '#3B82F6' }
                        ]} 
                    />
                </View>
            </View>

            {/* Row 3: Footer Info */}
            <View style={styles.cardFooter}>
                {item.rewardDescription ? (
                    <Text style={styles.rewardText} numberOfLines={1}>
                        🎁 {item.rewardDescription}
                    </Text>
                ) : (
                    <View /> /* Spacer */
                )}
                
                <View style={styles.dateBadge}>
                    <CalendarClock size={10} color="#64748B" />
                    <Text style={styles.dateText}>{getTimeLeftCopy(item.daysLeft, item.status)}</Text>
                </View>
            </View>
        </View>
    );
};

// --- Main Component ---
export default function TargetTracker({ refreshTrigger }) {
    const { axiosAuth } = useAuth();
    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchTargets = async () => {
            try {
                // Fetch targets specifically for the logged-in user
                const res = await axiosAuth().get('/targets/user/my');
                
                let targetData = [];
                if (Array.isArray(res.data)) targetData = res.data;
                else if (res.data?.data && Array.isArray(res.data.data)) targetData = res.data.data;

                setTargets(targetData);
            } catch (err) {
                console.log("🔴 Error fetching customer targets:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTargets();
    }, [refreshTrigger]);

    const filteredTargets = useMemo(() => {
        if (filter === 'all') return targets;
        return targets.filter((t) => t.targetType === filter);
    }, [targets, filter]);

    const stats = useMemo(() => {
        const total = filteredTargets.length;
        const achieved = filteredTargets.filter((t) => t.status === 'achieved' || t.isAchieved).length;
        return { total, achieved };
    }, [filteredTargets]);

    // --- Loading State ---
    if (loading && targets.length === 0) {
        return (
            <View style={styles.container}>
                 <View style={styles.chip}><Text style={styles.chipText}>My Targets</Text></View>
                 <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#1E6DEB" />
                 </View>
            </View>
        );
    }

    // --- Empty State ---
    if (!targets || targets.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.chip}><Text style={styles.chipText}>My Targets</Text></View>
                <View style={styles.emptyBox}>
                    <Target size={24} color="#CBD5E1" />
                    <Text style={styles.emptyTitle}>No active targets</Text>
                    <Text style={styles.emptySub}>Targets assigned to you will appear here.</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Floating Chip Title */}
            <View style={styles.chip}>
                <Text style={styles.chipText}>My Targets</Text>
            </View>

            {/* Top Controls: Stats & Filters */}
            <View style={styles.controlsRow}>
                {/* Mini Stats */}
                <View style={styles.miniStats}>
                    <Text style={styles.statLabel}>
                        <Text style={{fontWeight: '700', color: '#111'}}>{stats.total}</Text> Active
                    </Text>
                    <Text style={[styles.statLabel, { color: '#10B981' }]}>
                        <Text style={{fontWeight: '700'}}>{stats.achieved}</Text> Done
                    </Text>
                </View>

                {/* Filter Pills */}
                <View style={styles.filterRow}>
                    {['all', 'leader', 'customer'].map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => setFilter(type)}
                            style={[styles.filterBtn, filter === type && styles.filterBtnActive]}
                        >
                            <Text style={[styles.filterBtnText, filter === type && styles.filterBtnTextActive]}>
                                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Target List */}
            <View style={styles.listContainer}>
                {filteredTargets.map((item) => (
                    <TargetCard key={item.id} item={item} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // --- Main Container (Matches OverviewStats Style) ---
    container: {
        marginBottom: 24,
        borderWidth: 0.5,
        borderColor: "#30303028",
        borderRadius: 6,
        padding: 12,
        paddingTop: 24,
        backgroundColor: "#FAFAFA",
        position: "relative",
    },
    // --- Floating Chip ---
    chip: {
        position: "absolute",
        top: -14,
        left: 14,
        paddingHorizontal: 14,
        paddingVertical: 5,
        backgroundColor: "#fff",
        borderRadius: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    chipText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#333",
    },

    // --- Controls ---
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 2,
    },
    miniStats: {
        flexDirection: 'row',
        gap: 10,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    filterRow: {
        flexDirection: 'row',
        gap: 6,
    },
    filterBtn: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    filterBtnActive: {
        backgroundColor: '#1E6DEB',
    },
    filterBtnText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#6B7280',
    },
    filterBtnTextActive: {
        color: '#FFFFFF',
    },

    // --- Compact Card ---
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 1,
        elevation: 1,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    typeText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.5,
    },
    amountText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginTop: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    bgGreen: { backgroundColor: '#DCFCE7' },
    bgSlate: { backgroundColor: '#F1F5F9' },
    textGreen: { fontSize: 10, fontWeight: '700', color: '#166534' },
    textSlate: { fontSize: 10, fontWeight: '700', color: '#475569' },

    // --- Progress ---
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    progressLabel: { fontSize: 11, fontWeight: '600', color: '#374151' },
    toGoText: { fontSize: 10, color: '#6B7280' },
    progressBarTrack: {
        height: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },

    // --- Footer ---
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    rewardText: {
        fontSize: 11,
        color: '#1E40AF',
        fontWeight: '600',
        flex: 1,
        marginRight: 10,
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 4,
    },
    dateText: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '500',
    },

    // --- Empty State ---
    emptyBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    emptyTitle: {
        marginTop: 8,
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '600',
    },
    emptySub: {
        marginTop: 2,
        fontSize: 11,
        color: '#9CA3AF',
    },
});