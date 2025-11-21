import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Helper Components ---
const SummaryRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue} numberOfLines={1} ellipsizeMode="tail">{value || "—"}</Text>
  </View>
);

const StatusBadge = ({ label, url }) => (
  <View style={[styles.badge, url ? styles.badgeSuccess : styles.badgePending]}>
    <Ionicons name={url ? "checkmark-circle" : "alert-circle"} size={14} color={url ? "#15803D" : "#991B1B"} />
    <Text style={[styles.badgeText, url ? styles.textSuccess : styles.textPending]}>
        {label}
    </Text>
  </View>
);

export default function AddCustomerStep3() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { axiosAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleFinalize = async () => {
    setLoading(true);
    try {
      // 1. Prepare the Final Payload
      // We take params passed from Step 1 and Step 2
      const payload = {
        phone2: "", 
        address: params.address,
        aadhar_number: params.aadharNumber,
        pan_number: params.panNumber,
        bank_name: params.bankName,
        bank_account_number: params.accountNumber,
        bank_ifsc_code: params.ifscCode,
        // NOTE: Images were already uploaded to server in Step 2, 
        // so the backend likely associates them via 'customerId' already, 
        // or if your API needs URLs in the body, add them here:
        // aadhar_front_url: params.aadharFrontUrl, etc.
      };

      console.log("Finalizing Customer:", params.customerId);

      // 2. Call the Finalize API
      await axiosAuth().put(`/customers/${params.customerId}/finalize`, payload);

      // 3. Success & Redirect
      Alert.alert(
        "Onboarding Successful",
        "The customer application has been submitted for Admin verification.",
        [{ text: "Go to Dashboard", onPress: () => router.replace("/(leader)/customers") }]
      );

    } catch (err) {
      console.error("Finalize Error:", err);
      Alert.alert("Submission Failed", err?.response?.data?.message || "Could not finalize customer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Banner */}
        <View style={styles.banner}>
            <Ionicons name="information-circle" size={20} color="#1D4ED8" />
            <Text style={styles.bannerText}>Please review all details carefully before submitting.</Text>
        </View>

        {/* 1. Personal Info */}
        <View style={styles.card}>
           <Text style={styles.cardTitle}>Personal Details</Text>
           <View style={styles.divider} />
           <SummaryRow label="Full Name" value={`${params.firstName} ${params.lastName}`} />
           <SummaryRow label="Email" value={params.email} />
           <SummaryRow label="Phone" value={params.phone} />
           <SummaryRow label="Address" value={params.address} />
        </View>

        {/* 2. Bank Info */}
        <View style={styles.card}>
           <Text style={styles.cardTitle}>Financial Details</Text>
           <View style={styles.divider} />
           <SummaryRow label="Bank Name" value={params.bankName} />
           <SummaryRow label="Account No" value={params.accountNumber} />
           <SummaryRow label="IFSC Code" value={params.ifscCode} />
        </View>

        {/* 3. Documents */}
        <View style={styles.card}>
           <Text style={styles.cardTitle}>Documents Attached</Text>
           <View style={styles.divider} />
           <View style={styles.badgeContainer}>
              <StatusBadge label="Passbook" url={params.passbookUrl} />
              <StatusBadge label="Aadhar Front" url={params.aadharFrontUrl} />
              <StatusBadge label="Aadhar Back" url={params.aadharBackUrl} />
              <StatusBadge label="PAN Card" url={params.panUrl} />
           </View>
        </View>

      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
            onPress={handleFinalize} 
            disabled={loading} 
            style={styles.submitBtn}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.submitBtnText}>Complete Onboarding ✓</Text>
            )}
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#F3F4F6' },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#DBEAFE' },
  bannerText: { color: '#1E40AF', marginLeft: 8, fontSize: 13, flex: 1 },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { color: '#6B7280', fontSize: 14 },
  rowValue: { color: '#111', fontWeight: '600', fontSize: 14, maxWidth: '60%' },

  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
  badgeSuccess: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
  badgePending: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  badgeText: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
  textSuccess: { color: '#15803D' },
  textPending: { color: '#991B1B' },

  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#F3F4F6' },
  submitBtn: { backgroundColor: '#16A34A', height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: "#16A34A", shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});