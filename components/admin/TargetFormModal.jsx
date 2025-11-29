import { Target, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const baseForm = {
    targetType: 'leader',
    isGlobal: '1',
    assignedToId: '',
    startDate: '',
    endDate: '',
    targetAmount: '',
    rewardDescription: '',
    rewardPoster: '',
};

export default function TargetFormModal({ open, mode = 'create', initialData, onClose, onSubmit }) {
    const [form, setForm] = useState(baseForm);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setForm({
                ...baseForm,
                ...initialData,
                targetType: initialData?.targetType || baseForm.targetType,
                isGlobal: initialData?.isGlobal !== undefined ? String(initialData.isGlobal) : baseForm.isGlobal,
                assignedToId: initialData?.assignedToId || '',
                startDate: initialData?.startDate ? initialData.startDate.slice(0, 10) : '',
                endDate: initialData?.endDate ? initialData.endDate.slice(0, 10) : '',
                targetAmount: initialData?.targetAmount ? String(initialData.targetAmount) : '',
                rewardDescription: initialData?.rewardDescription || '',
                rewardPoster: initialData?.rewardPoster || '',
            });
        }
    }, [open, initialData]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!form.startDate || !form.endDate || !form.targetAmount) {
            Alert.alert('Error', 'Start date, end date, and target amount are required.');
            return;
        }
        if (form.isGlobal === '0' && !form.assignedToId) {
            Alert.alert('Error', 'Assign a user for non-global targets.');
            return;
        }

        setSubmitting(true);

        const payload = {
            targetType: form.targetType,
            isGlobal: Number(form.isGlobal),
            assignedToId: form.isGlobal === '0' ? form.assignedToId : undefined,
            startDate: form.startDate,
            endDate: form.endDate,
            targetAmount: Number(form.targetAmount),
            rewardDescription: form.rewardDescription || undefined,
            rewardPoster: form.rewardPoster || undefined,
        };

        try {
            await onSubmit(payload);
            onClose();
        } catch (err) {
            Alert.alert('Error', err?.message || 'Failed to save target');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.modalContainer}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerTitleContainer}>
                                <Target size={20} color="#2563eb" />
                                <View style={{ marginLeft: 8 }}>
                                    <Text style={styles.headerTitle}>
                                        {mode === 'edit' ? 'Update Target' : 'Create Target'}
                                    </Text>
                                    <Text style={styles.headerSubtitle}>Define targets for leaders/customers</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X size={16} color="#475569" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            <View style={styles.formGroup}>
                                {/* Target Type Selector */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Target For</Text>
                                    <View style={styles.row}>
                                        {['leader', 'customer'].map((type) => (
                                            <TouchableOpacity
                                                key={type}
                                                onPress={() => handleChange('targetType', type)}
                                                style={[
                                                    styles.segmentButton,
                                                    form.targetType === type ? styles.segmentActive : styles.segmentInactive
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.segmentText,
                                                    form.targetType === type ? styles.textWhite : styles.textSlate
                                                ]}>
                                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Scope Selector */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Scope</Text>
                                    <View style={styles.row}>
                                        <TouchableOpacity
                                            onPress={() => handleChange('isGlobal', '1')}
                                            style={[
                                                styles.segmentButton,
                                                form.isGlobal === '1' ? styles.segmentActiveGreen : styles.segmentInactive
                                            ]}
                                        >
                                            <Text style={[
                                                styles.segmentText,
                                                form.isGlobal === '1' ? styles.textWhite : styles.textSlate
                                            ]}>Global</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleChange('isGlobal', '0')}
                                            style={[
                                                styles.segmentButton,
                                                form.isGlobal === '0' ? styles.segmentActiveAmber : styles.segmentInactive
                                            ]}
                                        >
                                            <Text style={[
                                                styles.segmentText,
                                                form.isGlobal === '0' ? styles.textWhite : styles.textSlate
                                            ]}>Individual</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Assigned To ID */}
                                {form.isGlobal === '0' && (
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Assigned To (User ID)</Text>
                                        <TextInput
                                            value={form.assignedToId}
                                            onChangeText={(text) => handleChange('assignedToId', text)}
                                            placeholder="Enter User ID"
                                            placeholderTextColor="#94a3b8"
                                            style={styles.input}
                                        />
                                    </View>
                                )}

                                {/* Dates */}
                                <View style={styles.rowGap}>
                                    <View style={styles.flex1}>
                                        <Text style={styles.label}>Start Date</Text>
                                        <TextInput
                                            value={form.startDate}
                                            onChangeText={(text) => handleChange('startDate', text)}
                                            placeholder="YYYY-MM-DD"
                                            placeholderTextColor="#94a3b8"
                                            style={styles.input}
                                        />
                                    </View>
                                    <View style={styles.flex1}>
                                        <Text style={styles.label}>End Date</Text>
                                        <TextInput
                                            value={form.endDate}
                                            onChangeText={(text) => handleChange('endDate', text)}
                                            placeholder="YYYY-MM-DD"
                                            placeholderTextColor="#94a3b8"
                                            style={styles.input}
                                        />
                                    </View>
                                </View>

                                {/* Amount */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Target Amount (Rs.)</Text>
                                    <TextInput
                                        value={form.targetAmount}
                                        onChangeText={(text) => handleChange('targetAmount', text)}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor="#94a3b8"
                                        style={styles.input}
                                    />
                                </View>

                                {/* Reward Description */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Reward Description</Text>
                                    <TextInput
                                        value={form.rewardDescription}
                                        onChangeText={(text) => handleChange('rewardDescription', text)}
                                        multiline
                                        numberOfLines={3}
                                        placeholder="Describe the incentive..."
                                        placeholderTextColor="#94a3b8"
                                        style={[styles.input, styles.textArea]}
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        {/* Footer Actions */}
                        <View style={styles.footer}>
                            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={submitting}
                                style={styles.submitButton}
                            >
                                {submitting && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />}
                                <Text style={styles.submitButtonText}>
                                    {mode === 'edit' ? 'Update' : 'Create'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 16,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#64748b',
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 20,
    },
    scrollContent: {
        padding: 20,
    },
    formGroup: {
        gap: 16,
    },
    inputContainer: {
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#0f172a',
        backgroundColor: '#fff',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: 8,
    },
    rowGap: {
        flexDirection: 'row',
        gap: 16,
    },
    flex1: {
        flex: 1,
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    segmentInactive: {
        backgroundColor: '#fff',
        borderColor: '#cbd5e1',
    },
    segmentActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    segmentActiveGreen: {
        backgroundColor: '#16a34a',
        borderColor: '#16a34a',
    },
    segmentActiveAmber: {
        backgroundColor: '#d97706',
        borderColor: '#d97706',
    },
    segmentText: {
        fontWeight: '600',
        fontSize: 14,
    },
    textWhite: {
        color: '#fff',
    },
    textSlate: {
        color: '#475569',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
        gap: 12,
    },
    cancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        backgroundColor: '#fff',
    },
    cancelButtonText: {
        color: '#334155',
        fontWeight: '600',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#2563eb',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});