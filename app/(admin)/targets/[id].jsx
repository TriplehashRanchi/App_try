import TargetFormModal from '@/components/admin/TargetFormModal';
import { useAuth } from '@/context/AuthContext';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Filter, Pencil, Search, Trash2, Trophy } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const formatAmount = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

export default function TargetDetailPage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { axiosAuth, loading: authLoading } = useAuth();

    const [target, setTarget] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);

    const [filterSearch, setFilterSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState(''); // '' | 'achieved' | 'pending'

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const res = await axiosAuth().get(`/targets/${id}/detail`);
            setTarget(res.data?.target || null);
            setParticipants(res.data?.participants || []);
        } catch (err) {
            Alert.alert('Error', 'Failed to load target details');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && id) {
            fetchDetails();
        }
    }, [authLoading, id]);

    const handleUpdate = async (payload) => {
        await axiosAuth().put(`/targets/${id}`, payload);
        Alert.alert('Success', 'Target updated');
        fetchDetails();
    };

    const handleDelete = () => {
        Alert.alert('Delete Target?', 'Related achievements will be removed.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await axiosAuth().delete(`/targets/${id}`);
                        router.replace('/(admin)/targets');
                    } catch (err) {
                        Alert.alert('Error', 'Delete failed');
                    }
                },
            },
        ]);
    };

    const filteredParticipants = useMemo(() => {
        let list = [...participants];
        if (filterSearch) {
            list = list.filter((p) => p.username?.toLowerCase().includes(filterSearch.toLowerCase()));
        }
        if (filterStatus) {
            const isAchieved = filterStatus === 'achieved';
            list = list.filter((p) => (p.isAchieved || p.status === 'achieved') === isAchieved);
        }
        return list.sort((a, b) => Number(b.progress || 0) - Number(a.progress || 0));
    }, [participants, filterSearch, filterStatus]);

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading details...</Text>
            </View>
        );
    }

    if (!target) return null;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color="#475569" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Target Detail</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => setFormOpen(true)} style={styles.iconButtonBlue}>
                        <Pencil size={20} color="#1d4ed8" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} style={styles.iconButtonRed}>
                        <Trash2 size={20} color="#dc2626" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Stats Grid */}
                <View style={styles.gridRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Target</Text>
                        <Text style={styles.statValue}>{formatAmount(target.targetAmount)}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Type</Text>
                        <Text style={[styles.statValue, styles.capitalize]}>{target.targetType}</Text>
                    </View>
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoItem}>
                        <Text style={styles.statLabel}>Window</Text>
                        <Text style={styles.infoText}>
                            {dayjs(target.startDate).format('DD MMM YYYY')} - {dayjs(target.endDate).format('DD MMM YYYY')}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.statLabel}>Reward</Text>
                        <Text style={styles.infoTextSub}>{target.rewardDescription || 'No description'}</Text>
                    </View>
                    <View>
                        <Text style={styles.statLabel}>Scope</Text>
                        <Text style={styles.infoTextSub}>
                            {target.isGlobal ? 'Global (All Eligible)' : `Individual (ID: ${target.assignedToId})`}
                        </Text>
                    </View>
                </View>

                {/* Participants Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Participants ({participants.length})</Text>

                    {/* Filters */}
                    <View style={styles.filterRow}>
                        <View style={styles.searchBox}>
                            <Search size={16} color="#94a3b8" />
                            <TextInput
                                value={filterSearch}
                                onChangeText={setFilterSearch}
                                placeholder="Search user..."
                                placeholderTextColor="#94a3b8"
                                style={styles.searchInput}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={() => setFilterStatus(prev => prev === '' ? 'achieved' : prev === 'achieved' ? 'pending' : '')}
                            style={[styles.filterButton, filterStatus ? styles.filterButtonActive : styles.filterButtonInactive]}
                        >
                            <Filter size={14} color={filterStatus ? '#2563eb' : '#64748b'} />
                            <Text style={styles.filterButtonText}>
                                {filterStatus === '' ? 'All' : filterStatus === 'achieved' ? 'Achieved' : 'Pending'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Participants List */}
                {filteredParticipants.map((p) => {
                    const progress = Number(p.progress || 0);
                    const isAchieved = p.isAchieved || p.status === 'achieved';

                    return (
                        <View key={p.id} style={styles.participantCard}>
                            <View style={styles.participantHeader}>
                                <View>
                                    <Text style={styles.participantName}>{p.username || 'Unknown User'}</Text>
                                    <Text style={styles.participantRole}>{p.role}</Text>
                                </View>
                                <View style={isAchieved ? styles.badgeGreen : styles.badgeSlate}>
                                    <Text style={isAchieved ? styles.badgeTextGreen : styles.badgeTextSlate}>
                                        {isAchieved ? 'Achieved' : 'Pending'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.amountRow}>
                                <Trophy size={14} color="#d97706" />
                                <Text style={styles.participantAmount}>{formatAmount(p.achievedAmount)}</Text>
                            </View>

                            <View>
                                <View style={styles.progressLabelRow}>
                                    <Text style={styles.progressLabel}>Progress</Text>
                                    <Text style={styles.progressValue}>{progress.toFixed(1)}%</Text>
                                </View>
                                <View style={styles.progressBarTrack}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            {
                                                width: `${Math.min(progress, 100)}%`,
                                                backgroundColor: isAchieved ? '#22c55e' : '#3b82f6'
                                            }
                                        ]}
                                    />
                                </View>
                            </View>

                            {p.achievedOn && (
                                <Text style={styles.achievedDate}>
                                    Done on {dayjs(p.achievedOn).format('DD MMM')}
                                </Text>
                            )}
                        </View>
                    );
                })}

                {filteredParticipants.length === 0 && (
                    <Text style={styles.emptyText}>No participants found</Text>
                )}
            </ScrollView>

            <TargetFormModal
                open={formOpen}
                mode="edit"
                initialData={{ ...target }}
                onClose={() => setFormOpen(false)}
                onSubmit={handleUpdate}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 8,
        color: '#64748b',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButtonBlue: {
        padding: 8,
        backgroundColor: '#eff6ff',
        borderRadius: 8,
    },
    iconButtonRed: {
        padding: 8,
        backgroundColor: '#fef2f2',
        borderRadius: 8,
    },
    scrollContent: {
        padding: 16,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        color: '#64748b',
    },
    statValue: {
        marginTop: 4,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    capitalize: {
        textTransform: 'capitalize',
    },
    infoCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 24,
        gap: 12,
    },
    infoItem: {
        marginBottom: 4,
    },
    infoText: {
        marginTop: 4,
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    infoTextSub: {
        marginTop: 4,
        fontSize: 14,
        color: '#334155',
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 8,
        marginLeft: 8,
        fontSize: 14,
        color: '#1e293b',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        gap: 4,
    },
    filterButtonInactive: {
        backgroundColor: '#fff',
        borderColor: '#e2e8f0',
    },
    filterButtonActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#bfdbfe',
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    participantCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 12,
    },
    participantHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    participantName: {
        fontWeight: 'bold',
        color: '#0f172a',
        fontSize: 14,
    },
    participantRole: {
        fontSize: 12,
        color: '#64748b',
        textTransform: 'capitalize',
    },
    badgeGreen: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
    },
    badgeTextGreen: {
        fontSize: 11,
        fontWeight: '700',
        color: '#15803d',
    },
    badgeSlate: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
    },
    badgeTextSlate: {
        fontSize: 11,
        fontWeight: '700',
        color: '#475569',
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    participantAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    progressLabel: {
        fontSize: 12,
        color: '#64748b',
    },
    progressValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#334155',
    },
    progressBarTrack: {
        height: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    achievedDate: {
        fontSize: 12,
        color: '#15803d',
        marginTop: 8,
        textAlign: 'right',
    },
    emptyText: {
        textAlign: 'center',
        color: '#94a3b8',
        marginTop: 16,
    },
});