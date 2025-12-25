import UploadSheet from "@/components/leader/UploadSheet";
import { INDIAN_BANKS } from "@/constants/banks";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Components ---
const ProgressBar = ({ step }) => (
  <View style={styles.progressContainer}>
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${step * 33.3}%` }]} />
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.progressText}>Verification</Text>
        <Text style={styles.progressText}>Step {step}/3</Text>
    </View>
  </View>
);

const InputLabel = ({ label, error }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={styles.label}>{label}</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

const UploadBox = ({ label, url, onPress, type }) => {
    const isUploaded = !!url;
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.uploadBox, isUploaded && styles.uploadBoxSuccess]}>
            <View style={[styles.iconCircle, isUploaded && styles.iconCircleSuccess]}>
                <Ionicons name={isUploaded ? "checkmark" : "cloud-upload-outline"} size={20} color={isUploaded ? "#fff" : "#6B7280"} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.uploadLabel}>{label}</Text>
                <Text style={[styles.uploadSub, isUploaded && { color: '#16A34A' }]}>
                    {isUploaded ? "Document attached" : "Tap to upload"}
                </Text>
            </View>
            {isUploaded && <Ionicons name="eye-outline" size={20} color="#16A34A" />}
        </TouchableOpacity>
    );
};

export default function AddCustomerStep2() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { axiosAuth } = useAuth();

  // State
  const [form, setForm] = useState({
    bankName: "", accountNumber: "", ifscCode: "",
    aadharNumber: "", panNumber: "",
    aadharFrontUrl: "", aadharBackUrl: "", panUrl: "", passbookUrl: "",
  });

  const [uploadType, setUploadType] = useState(null);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  
  // Validation State
  const [kycErrors, setKycErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  const filteredBanks = useMemo(() => INDIAN_BANKS.filter(b => b.toLowerCase().includes(bankSearch.toLowerCase())), [bankSearch]);

  // --- API: Check KYC (Crucial for Trust) ---
 // --- Inside AddCustomerStep2 component ---

  const validateKyc = async () => {
    // 1. Don't call API if fields are empty or too short
    if (
       (!form.aadharNumber || form.aadharNumber.length < 12) && 
       (!form.panNumber || form.panNumber.length < 10) && 
       (!form.accountNumber || form.accountNumber.length < 5)
    ) {
       return; 
    }

    setIsValidating(true);
    try {
      // 2. Only send parameters that actually have values
      const params = {};
      if (form.aadharNumber && form.aadharNumber.length === 12) params.aadhar = form.aadharNumber;
      if (form.panNumber && form.panNumber.length === 10) params.pan = form.panNumber;
      if (form.accountNumber && form.accountNumber.length > 5) params.account = form.accountNumber;
      if (form.ifscCode) params.ifsc = form.ifscCode;

      const query = new URLSearchParams(params).toString();
      
      // If we have nothing valid to check, stop.
      if (!query) {
          setIsValidating(false);
          return;
      }

      const res = await axiosAuth().get(`/customers/check-kyc?${query}`);
      
      setKycErrors({
        aadhar: res.data.aadharExists ? "Already registered" : null,
        pan: res.data.panExists ? "Already registered" : null,
        account: res.data.accountExists ? "Already registered" : null,
      });

    } catch (error) {
      // 3. Handle 400 cleanly so it doesn't crash or spam logs
      if (error.response && error.response.status === 400) {
        //  console.log("KYC Input invalid yet, waiting for user to finish typing...");
      } else {
         console.log("KYC Check System Error", error);
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleNext = () => {
      // Pass all data (Step 1 params + Step 2 form) to Step 3
      router.push({
          pathname: "/(leader)/add-customer/step3",
          params: { ...params, ...form }
      });
  };

  const isFormValid = 
    form.bankName && form.accountNumber?.length > 5 && form.ifscCode?.length > 4 &&
    form.aadharNumber?.length === 12 && form.panNumber?.length === 10 &&
    form.passbookUrl && form.aadharFrontUrl && form.aadharBackUrl && form.panUrl &&
    !kycErrors.aadhar && !kycErrors.pan && !kycErrors.account;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "0" : "0"} style={{ flex: 1 }}>
    <SafeAreaView style={styles.container}>
      
        
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bank & KYC</Text>
            {isValidating && <ActivityIndicator size="small" color="#2563EB" />}
        </View>

        <ProgressBar step={2} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* Card 1: Bank Details */}
            <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                    <View style={styles.cardIconBg}><Ionicons name="business" size={18} color="#2563EB" /></View>
                    <Text style={styles.cardTitle}>Banking Information</Text>
                </View>

                {/* Bank Dropdown */}
                <View style={{ marginBottom: 16 }}>
                    <Text style={styles.label}>Bank Name</Text>
                    <TouchableOpacity onPress={() => setBankModalVisible(true)} style={styles.dropdown}>
                        <Text style={[styles.inputText, !form.bankName && { color: '#9CA3AF' }]}>
                            {form.bankName || "Select Bank"}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                <View style={{ marginBottom: 16 }}>
                    <InputLabel label="Account Number" error={kycErrors.account} />
                    <TextInput 
                        style={[styles.input, kycErrors.account && styles.inputError]} 
                        placeholder="Enter Account Number" 
                        value={form.accountNumber}
                        onChangeText={v => setForm({...form, accountNumber: v})}
                        onBlur={validateKyc}
                        keyboardType="numeric"
                    />
                </View>

                <View style={{ marginBottom: 16 }}>
                    <InputLabel label="IFSC Code" />
                    <TextInput 
                        style={styles.input} 
                        placeholder="e.g. SBIN0001234" 
                        value={form.ifscCode}
                        onChangeText={v => setForm({...form, ifscCode: v.toUpperCase()})}
                        maxLength={11}
                        autoCapitalize="characters"
                    />
                </View>

                <UploadBox label="Upload Passbook/Cheque" url={form.passbookUrl} onPress={() => setUploadType('passbook')} />
            </View>

            {/* Card 2: Identity */}
            <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                    <View style={styles.cardIconBg}><Ionicons name="id-card" size={18} color="#2563EB" /></View>
                    <Text style={styles.cardTitle}>Identity Verification</Text>
                </View>

                <View style={{ marginBottom: 16 }}>
                    <InputLabel label="Aadhar Number" error={kycErrors.aadhar} />
                    <TextInput 
                        style={[styles.input, kycErrors.aadhar && styles.inputError]} 
                        placeholder="12-Digit Aadhar Number" 
                        value={form.aadharNumber}
                        onChangeText={v => setForm({...form, aadharNumber: v})}
                        onBlur={validateKyc}
                        keyboardType="numeric"
                        maxLength={12}
                    />
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                    <View style={{ flex: 1 }}>
                        <UploadBox label="Aadhar Front" url={form.aadharFrontUrl} onPress={() => setUploadType('aadharFront')} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <UploadBox label="Aadhar Back" url={form.aadharBackUrl} onPress={() => setUploadType('aadharBack')} />
                    </View>
                </View>

                <View style={{ marginBottom: 16 }}>
                    <InputLabel label="PAN Number" error={kycErrors.pan} />
                    <TextInput 
                        style={[styles.input, kycErrors.pan && styles.inputError]} 
                        placeholder="10-Digit PAN Number" 
                        value={form.panNumber}
                        onChangeText={v => setForm({...form, panNumber: v.toUpperCase()})}
                        onBlur={validateKyc}
                        maxLength={10}
                        autoCapitalize="characters"
                    />
                </View>
                
                <UploadBox label="Upload PAN Card" url={form.panUrl} onPress={() => setUploadType('pan')} />
            </View>

        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
            <TouchableOpacity 
                onPress={handleNext} 
                disabled={!isFormValid}
                style={[styles.nextBtn, !isFormValid && styles.nextBtnDisabled]}
            >
                <Text style={styles.nextBtnText}>Review & Submit →</Text>
            </TouchableOpacity>
        </View>

        {/* Bank Modal */}
        <Modal visible={bankModalVisible} animationType="slide" presentationStyle="pageSheet">
           <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
              <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#F3F4F6' }}>
                 <TouchableOpacity onPress={() => setBankModalVisible(false)}><Ionicons name="close" size={28} /></TouchableOpacity>
                 <TextInput style={{ flex: 1, marginLeft: 16, fontSize: 16, fontWeight: '500' }} placeholder="Search Bank..." value={bankSearch} onChangeText={setBankSearch} autoFocus />
              </View>
              <FlatList data={filteredBanks} keyExtractor={i => i} renderItem={({item}) => (
                 <TouchableOpacity onPress={() => { setForm({ ...form, bankName: item }); setBankModalVisible(false); }} style={{ padding: 16, borderBottomWidth: 1, borderColor: '#F9FAFB' }}>
                    <Text style={{ fontSize: 16, color: '#374151' }}>{item}</Text>
                 </TouchableOpacity>
              )} />
           </SafeAreaView>
        </Modal>

        {/* Upload Sheet */}
        {uploadType && (
            <UploadSheet 
                type={uploadType} 
                customerId={params.customerId} 
                onClose={() => setUploadType(null)} 
                onSuccess={(type, url) => {
                    setForm(prev => ({ ...prev, [`${type}Url`]: url }));
                    setUploadType(null);
                }} 
            />
        )}

      
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#F3F4F6' },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  
  progressContainer: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff' },
  progressTrack: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 3 },
  progressText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  
  scrollContent: { padding: 20, paddingBottom: 100 },
  
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardIconBg: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },

  label: { fontSize: 12, fontWeight: '600', color: '#4B5563', textTransform: 'uppercase' },
  errorText: { fontSize: 11, color: '#EF4444', fontWeight: '600' },
  
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111' },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  inputText: { fontSize: 15, color: '#111' },
  
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  
  uploadBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed', backgroundColor: '#F9FAFB' },
  uploadBoxSuccess: { borderColor: '#86EFAC', backgroundColor: '#F0FDF4', borderStyle: 'solid' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconCircleSuccess: { backgroundColor: '#22C55E' },
  uploadLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  uploadSub: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },

  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#F3F4F6', marginBottom: -25 },
  nextBtn: { backgroundColor: '#2563EB', height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: "#2563EB", shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  nextBtnDisabled: { backgroundColor: '#9CA3AF', shadowOpacity: 0 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});