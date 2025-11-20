import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DetailRow = ({ label, value, isLast }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: isLast ? 0 : 1, borderColor: '#f3f4f6' }}>
    <Text style={{ color: "#6b7280", fontSize: 14 }}>{label}</Text>
    <Text style={{ color: "#111827", fontWeight: "600", fontSize: 14, maxWidth: '60%', textAlign: 'right' }}>{value || "—"}</Text>
  </View>
);

const DocBadge = ({ label, url }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 8, backgroundColor: url ? '#ecfdf5' : '#fef2f2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 }}>
    <Ionicons name={url ? "checkmark-circle" : "alert-circle"} size={16} color={url ? "#059669" : "#ef4444"} />
    <Text style={{ marginLeft: 4, fontSize: 12, fontWeight: '600', color: url ? "#065f46" : "#991b1b" }}>
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
      const payload = {
        phone2: "", // Optional
        address: params.address,
        aadhar_number: params.aadharNumber,
        pan_number: params.panNumber,
        bank_name: params.bankName,
        bank_account_number: params.accountNumber,
        bank_ifsc_code: params.ifscCode,
      };

      await axiosAuth().put(`/customers/${params.customerId}/finalize`, payload);

      Alert.alert(
        "Success",
        "Customer onboarded successfully! Waiting for admin verification.",
        [{ text: "OK", onPress: () => router.replace("/(leader)/customers") }]
      );

    } catch (err) {
      Alert.alert("Submission Failed", err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
       <View style={{ paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#111827" }}>Final Review</Text>
        <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>Step 3 of 3: Confirm Details</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Personal Info Card */}
        <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 10, color: "#4f46e5" }}>Personal Details</Text>
          <DetailRow label="Full Name" value={`${params.firstName} ${params.lastName}`} />
          <DetailRow label="Email" value={params.email} />
          <DetailRow label="Phone" value={params.phone} />
          <DetailRow label="Address" value={params.address} isLast />
        </View>

        {/* Bank Info Card */}
        <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 10, color: "#4f46e5" }}>Financial Details</Text>
          <DetailRow label="Bank Name" value={params.bankName} />
          <DetailRow label="Account No" value={params.accountNumber} />
          <DetailRow label="IFSC Code" value={params.ifscCode} isLast />
        </View>

        {/* Documents Status */}
        <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 30, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 }}>
           <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 15, color: "#4f46e5" }}>Document Status</Text>
           <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <DocBadge label="Passbook" url={params.passbookUrl} />
              <DocBadge label="Aadhar Front" url={params.aadharFrontUrl} />
              <DocBadge label="Aadhar Back" url={params.aadharBackUrl} />
              <DocBadge label="PAN Card" url={params.panUrl} />
           </View>
        </View>

        {/* Buttons */}
        <View style={{ marginBottom: 40 }}>
          <TouchableOpacity
            onPress={handleFinalize}
            disabled={loading}
            style={{
              backgroundColor: "#16a34a",
              paddingVertical: 18,
              borderRadius: 14,
              alignItems: 'center',
              shadowColor: "#16a34a",
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 4,
              marginBottom: 15
            }}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Complete Onboarding ✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={{ padding: 15, alignItems: 'center' }}>
             <Text style={{ color: "#6b7280", fontWeight: "600" }}>Go Back</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}