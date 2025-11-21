import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Premium Components ---
const ProgressBar = ({ step }) => (
  <View style={styles.progressContainer}>
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${step * 33}%` }]} />
    </View>
    <Text style={styles.progressText}>Step {step} of 3</Text>
  </View>
);

const IconicInput = ({ label, icon, value, onChangeText, placeholder, secure, keyboardType }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={20} color="#9CA3AF" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        keyboardType={keyboardType}
      />
    </View>
  </View>
);

export default function AddCustomerStep1() {
  const router = useRouter();
  const { user, axiosAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", address: "", referredByLeaderId: "",
  });

  useEffect(() => {
    if (user) setForm((p) => ({ ...p, referredByLeaderId: user.id }));
  }, [user]);

  const handleNext = async () => {
    if (!form.firstName || !form.lastName || !form.phone || !form.password) {
      Alert.alert("Required", "Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await axiosAuth().post('/customers/draft', form);
      router.push({ pathname: "/(leader)/add-customer/step2", params: { ...form, customerId: res.data.customerId } });
    } catch (error) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to create draft.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Customer</Text>
        </View>

        <ProgressBar step={1} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <IconicInput label="First Name" icon="person-outline" placeholder="John" value={form.firstName} onChangeText={(v) => setForm({ ...form, firstName: v })} />
            <IconicInput label="Last Name" icon="person-outline" placeholder="Doe" value={form.lastName} onChangeText={(v) => setForm({ ...form, lastName: v })} />
            <IconicInput label="Email" icon="mail-outline" placeholder="john@example.com" keyboardType="email-address" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} />
            <IconicInput label="Mobile Number" icon="call-outline" placeholder="98765 43210" keyboardType="phone-pad" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} />
            <IconicInput label="Password" icon="lock-closed-outline" placeholder="••••••••" secure value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} />
            <IconicInput label="Address" icon="location-outline" placeholder="Flat No, Street, City" value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleNext} disabled={isLoading} style={styles.primaryBtn}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save & Continue</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  progressContainer: { paddingHorizontal: 20, paddingBottom: 15, backgroundColor: '#fff' },
  progressTrack: { height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 2 },
  progressText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  scrollContent: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6, textTransform: 'uppercase' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, height: 50, backgroundColor: '#F9FAFB' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#111' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#F3F4F6' },
  primaryBtn: { backgroundColor: '#2563EB', height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: "#2563EB", shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});