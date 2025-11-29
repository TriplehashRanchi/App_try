import TargetFormModal from '@/components/admin/TargetFormModal';
import { useAuth } from '@/context/AuthContext';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { CalendarRange, ChevronRight, Filter, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const formatAmount = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

export default function AdminTargetsPage() {
    const router = useRouter();
    const { axiosAuth, loading: authLoading } = useAuth();
    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [editingTarget, setEditingTarget] = useState(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState(''); // '' | 'leader' | 'customer'

    const fetchTargets = async () => {
        setLoading(true);
        try {
            const res = await axiosAuth().get('/targets');
            setTargets(res.data || []);
        } catch (err) {
            Alert.alert('Error', 'Failed to load targets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchTargets();
        }
    }, [authLoading]);

    const filteredTargets = useMemo(() => {
        return (targets || [])
            .filter((t) => {
                const matchesSearch =
                    !search ||
                    t.rewardDescription?.toLowerCase().includes(search.toLowerCase()) ||
                    t.targetType?.toLowerCase().includes(search.toLowerCase()) ||
                    String(t.assignedToId || '').includes(search);
                const matchesType = !typeFilter || t.targetType === typeFilter;
                return matchesSearch && matchesType;
            })
            .sort((a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf());
    }, [targets, search, typeFilter]);

    const handleCreate = async (payload) => {
        await axiosAuth().post('/targets', payload);
        Alert.alert('Success', 'Target created');
        fetchTargets();
    };

    const handleUpdate = async (payload) => {
        if (!editingTarget) return;
        await axiosAuth().put(`/targets/${editingTarget.id}`, payload);
        Alert.alert('Success', 'Target updated');
        setEditingTarget(null);
        fetchTargets();
    };

    const handleDelete = (target) => {
        Alert.alert(
            'Delete Target?',
            'Related achievements will also be removed. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await axiosAuth().delete(`/targets/${target.id}`);
                            fetchTargets();
                        } catch (err) {
                            Alert.alert('Error', 'Delete failed');
                        }
                    },
                },
            ]
        );
    };

    const openCreate = () => {
        setEditingTarget(null);
        setFormOpen(true);
    };

    const openEdit = (target) => {
        setEditingTarget({ ...target });
        setFormOpen(true);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(admin)/targets/${item.id}`)}
            style={styles.card}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={styles.badgeRow}>
                    <View style={styles.badgeBlue}>
                        <Text style={styles.badgeTextBlue}>{item.targetType}</Text>
                    </View>
                    <View style={item.isGlobal ? styles.badgeGreen : styles.badgeAmber}>
                        <Text style={item.isGlobal ? styles.badgeTextGreen : styles.badgeTextAmber}>
                            {item.isGlobal ? 'Global' : 'Individual'}
                        </Text>
                    </View>
                </View>
                <ChevronRight size={16} color="#94a3b8" />
            </View>

            <View style={styles.amountContainer}>
                <Text style={styles.amountText}>{formatAmount(item.targetAmount)}</Text>
            </View>

            {!item.isGlobal && (
                <Text style={styles.assignedText}>Assigned User ID: {item.assignedToId}</Text>
            )}

            <View style={styles.dateRow}>
                <CalendarRange size={14} color="#64748b" />
                <Text style={styles.dateText}>
                    {dayjs(item.startDate).format('DD MMM')} - {dayjs(item.endDate).format('DD MMM YYYY')}
                </Text>
            </View>

            <View style={styles.cardFooter}>
                <Text numberOfLines={1} style={styles.descriptionText}>
                    {item.rewardDescription || 'No reward info'}
                </Text>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); openEdit(item); }}
                        style={styles.iconButtonBlue}
                    >
                        <Pencil size={14} color="#1d4ed8" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); handleDelete(item); }}
                        style={styles.iconButtonRed}
                    >
                        <Trash2 size={14} color="#dc2626" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.pageTitle}>Targets</Text>
                        <Text style={styles.pageSubtitle}>Manage leader & customer targets</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={fetchTargets} style={styles.refreshButton}>
                            <RefreshCw size={20} color="#475569" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={openCreate} style={styles.createButton}>
                            <Plus size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Filters */}
                <View style={styles.filterContainer}>
                    <View style={styles.searchBox}>
                        <Search size={16} color="#94a3b8" />
                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Search targets..."
                            placeholderTextColor="#94a3b8"
                            style={styles.searchInput}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={() => setTypeFilter(prev => prev === '' ? 'leader' : prev === 'leader' ? 'customer' : '')}
                        style={[styles.filterButton, typeFilter ? styles.filterButtonActive : styles.filterButtonInactive]}
                    >
                        <Filter size={14} color={typeFilter ? '#2563eb' : '#64748b'} />
                        <Text style={[styles.filterButtonText, typeFilter ? styles.textBlue : styles.textSlate]}>
                            {typeFilter ? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) : 'All'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text style={styles.loadingText}>Loading targets...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredTargets}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No targets found.</Text>
                        </View>
                    }
                />
            )}

            <TargetFormModal
                open={formOpen}
                mode={editingTarget ? 'edit' : 'create'}
                initialData={editingTarget}
                onClose={() => {
                    setFormOpen(false);
                    setEditingTarget(null);
                }}
                onSubmit={(payload) => (editingTarget ? handleUpdate(payload) : handleCreate(payload))}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 50, 
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    pageSubtitle: {
        fontSize: 12,
        color: '#64748b',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    refreshButton: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    createButton: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#2563eb',
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
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
        borderColor: '#cbd5e1',
    },
    filterButtonActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#bfdbfe',
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    textBlue: { color: '#1d4ed8' },
    textSlate: { color: '#64748b' },
    
    // List & Card Styles
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 8,
        color: '#64748b',
    },
    listContent: {
        padding: 16,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#64748b',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 16,
        marginBottom: 12,
        borderWidth: 0,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    badgeBlue: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeTextBlue: {
        fontSize: 11,
        fontWeight: '700',
        color: '#1d4ed8',
        textTransform: 'capitalize',
    },
    badgeGreen: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeTextGreen: {
        fontSize: 11,
        fontWeight: '700',
        color: '#15803d',
    },
    badgeAmber: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeTextAmber: {
        fontSize: 11,
        fontWeight: '700',
        color: '#b45309',
    },
    amountContainer: {
        marginBottom: 8,
    },
    amountText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0f172a',
    },
    assignedText: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 8,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    dateText: {
        fontSize: 12,
        color: '#475569',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
    },
    descriptionText: {
        flex: 1,
        fontSize: 12,
        color: '#64748b',
        marginRight: 8,
    },
    actionButtons: {
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
});