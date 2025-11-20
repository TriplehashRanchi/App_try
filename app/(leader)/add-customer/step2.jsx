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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Imports ---
import UploadSheet from "@/components/leader/UploadSheet";
import { INDIAN_BANKS } from "@/constants/banks";

// --- 1. Premium Input Component (Defined Outside to fix Keyboard Bugs) ---
const PremiumInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  onBlur,
  keyboardType = "default",
  maxLength,
  error,
}) => (
  <View style={{ marginBottom: 20 }}>
    <Text
      style={{
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 8,
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
    >
      {label}
    </Text>
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      keyboardType={keyboardType}
      maxLength={maxLength}
      autoCapitalize={
        maxLength === 10 || maxLength === 11 ? "characters" : "none"
      }
      style={{
        backgroundColor: "#fff",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1.5,
        borderColor: error ? "#ef4444" : "#e5e7eb",
        color: "#111",
      }}
    />
    {error && (
      <View
        style={{ flexDirection: "row", marginTop: 6, alignItems: "center" }}
      >
        <Ionicons name="alert-circle" size={14} color="#ef4444" />
        <Text style={{ color: "#ef4444", fontSize: 12, marginLeft: 4 }}>
          {error}
        </Text>
      </View>
    )}
  </View>
);

// --- 2. Upload Row Component ---
const UploadRow = ({ label, url, onPress, icon = "cloud-upload-outline" }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={{
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: url ? "#f0fdf4" : "#f9fafb",
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: url ? "#86efac" : "#e5e7eb",
      borderStyle: url ? "solid" : "dashed",
    }}
  >
    <View
      style={{
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: url ? "#22c55e" : "#e5e7eb",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
      }}
    >
      <Ionicons
        name={url ? "checkmark" : icon}
        size={20}
        color={url ? "#fff" : "#6b7280"}
      />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 15, fontWeight: "600", color: "#1f2937" }}>
        {label}
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: url ? "#15803d" : "#6b7280",
          marginTop: 2,
        }}
      >
        {url ? "Document Uploaded" : "Tap to upload"}
      </Text>
    </View>
    {url && <Ionicons name="eye-outline" size={20} color="#15803d" />}
  </TouchableOpacity>
);

// --- 3. Bank Modal Component ---
const BankPickerModal = ({ visible, onClose, onSelect }) => {
  const [search, setSearch] = useState("");
  const filteredBanks = useMemo(
    () =>
      INDIAN_BANKS.filter((b) =>
        b.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={{
            padding: 16,
            borderBottomWidth: 1,
            borderColor: "#f3f4f6",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
            <Ionicons name="close" size={28} color="#111" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", marginLeft: 12 }}>
            Select Bank
          </Text>
        </View>
        <View style={{ padding: 16 }}>
          <TextInput
            style={{
              backgroundColor: "#f3f4f6",
              padding: 14,
              borderRadius: 12,
              fontSize: 16,
            }}
            placeholder="Search bank name..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <FlatList
          data={filteredBanks}
          keyExtractor={(item) => item}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onSelect(item);
                onClose();
              }}
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderColor: "#f9fafb",
              }}
            >
              <Text style={{ fontSize: 16, color: "#374151" }}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

// --- MAIN SCREEN ---
export default function AddCustomerStep2() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { axiosAuth } = useAuth();

  // State
  const [form, setForm] = useState({
    customerId: params.customerId,
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    aadharNumber: "",
    panNumber: "",
    aadharFrontUrl: "",
    aadharBackUrl: "",
    panUrl: "",
    passbookUrl: "",
  });

  const [uploadType, setUploadType] = useState(null);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [kycWarnings, setKycWarnings] = useState({
    aadhar: false,
    pan: false,
    account: false,
  });
  const [validating, setValidating] = useState(false);

  // Callback for UploadSheet
  const handleUploadSuccess = (type, url) => {
    setForm((prev) => ({ ...prev, [`${type}Url`]: url }));
    setUploadType(null);
  };

  // KYC Duplicate Check
  const checkKyc = async () => {
    if (!form.aadharNumber && !form.panNumber && !form.accountNumber) return;

    setValidating(true);
    try {
      const query = new URLSearchParams({
        aadhar: form.aadharNumber || "",
        pan: form.panNumber || "",
        account: form.accountNumber || "",
        ifsc: form.ifscCode || "",
      });

      const res = await axiosAuth().get(`/customers/check-kyc?${query}`);

      setKycWarnings({
        aadhar: res.data.aadharExists,
        pan: res.data.panExists,
        account: res.data.accountExists,
      });
    } catch (err) {
      console.log(
        "KYC Check:",
        err.response?.status === 400 ? "Incomplete Data" : err
      );
    } finally {
      setValidating(false);
    }
  };

  // Form Validation
  const isComplete =
    form.bankName?.length > 0 &&
    form.accountNumber?.length > 5 &&
    form.ifscCode?.length > 4 &&
    form.aadharNumber?.length === 12 &&
    form.panNumber?.length === 10 &&
    form.passbookUrl &&
    (form.aadharFrontUrl || form.aadharBackUrl) &&
    form.panUrl &&
    !kycWarnings.aadhar &&
    !kycWarnings.account;

  const goNext = () => {
    router.push({
      pathname: "/(leader)/add-customer/step3",
      params: { ...params, ...form },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <View
          style={{
            backgroundColor: "#fff",
            paddingHorizontal: 20,
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#111" }}>
            Verification
          </Text>
          <View
            style={{ flexDirection: "row", marginTop: 8, alignItems: "center" }}
          >
            <View
              style={{
                height: 4,
                flex: 1,
                backgroundColor: "#e5e7eb",
                borderRadius: 2,
              }}
            >
              <View
                style={{
                  width: "66%",
                  height: "100%",
                  backgroundColor: "#2563eb",
                  borderRadius: 2,
                }}
              />
            </View>
            <Text
              style={{
                marginLeft: 10,
                fontSize: 12,
                color: "#6b7280",
                fontWeight: "600",
              }}
            >
              Step 2/3
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          {/* BANK DETAILS CARD */}
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 16,
              marginBottom: 20,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                marginBottom: 20,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  padding: 8,
                  backgroundColor: "#eff6ff",
                  borderRadius: 8,
                  marginRight: 12,
                }}
              >
                <Ionicons name="business" size={20} color="#2563eb" />
              </View>
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: "#1f2937" }}
              >
                Bank Details
              </Text>
            </View>

            {/* Custom Dropdown Trigger */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  marginBottom: 8,
                  color: "#6b7280",
                  textTransform: "uppercase",
                }}
              >
                Bank Name
              </Text>
              <TouchableOpacity
                onPress={() => setBankModalVisible(true)}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: "#e5e7eb",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: form.bankName ? "#111" : "#9ca3af",
                  }}
                >
                  {form.bankName || "Select Bank"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <PremiumInput
              label="Account Number"
              placeholder="Enter Account No"
              value={form.accountNumber}
              onChangeText={(v) => setForm({ ...form, accountNumber: v })}
              onBlur={checkKyc}
              keyboardType="numeric"
              error={kycWarnings.account ? "Account already registered" : null}
            />

            <PremiumInput
              label="IFSC Code"
              placeholder="SBIN000XXXX"
              value={form.ifscCode}
              onChangeText={(v) =>
                setForm({ ...form, ifscCode: v.toUpperCase() })
              }
              maxLength={11}
            />

            <UploadRow
              label="Upload Passbook / Cheque"
              url={form.passbookUrl}
              onPress={() => setUploadType("passbook")}
              icon="document-text-outline"
            />
          </View>

          {/* KYC DETAILS CARD */}
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 16,
              marginBottom: 20,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                marginBottom: 20,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  padding: 8,
                  backgroundColor: "#eff6ff",
                  borderRadius: 8,
                  marginRight: 12,
                }}
              >
                <Ionicons name="id-card" size={20} color="#2563eb" />
              </View>
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: "#1f2937" }}
              >
                Identity Proof
              </Text>
              {validating && (
                <ActivityIndicator
                  style={{ marginLeft: "auto" }}
                  size="small"
                  color="#2563eb"
                />
              )}
            </View>

            <PremiumInput
              label="Aadhar Number"
              placeholder="12 Digit Aadhar No"
              value={form.aadharNumber}
              onChangeText={(v) => setForm({ ...form, aadharNumber: v })}
              onBlur={checkKyc}
              keyboardType="numeric"
              maxLength={12}
              error={kycWarnings.aadhar ? "Aadhar already exists" : null}
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <UploadRow
                  label="Aadhar Front"
                  url={form.aadharFrontUrl}
                  onPress={() => setUploadType("aadharFront")}
                />
              </View>
              <View style={{ flex: 1 }}>
                <UploadRow
                  label="Aadhar Back"
                  url={form.aadharBackUrl}
                  onPress={() => setUploadType("aadharBack")}
                />
              </View>
            </View>

            <View style={{ height: 15 }} />

            <PremiumInput
              label="PAN Number"
              placeholder="ABCDE1234F"
              value={form.panNumber}
              onChangeText={(v) =>
                setForm({ ...form, panNumber: v.toUpperCase() })
              }
              onBlur={checkKyc}
              maxLength={10}
              error={kycWarnings.pan ? "PAN already exists" : null}
            />

            <UploadRow
              label="Upload PAN Card"
              url={form.panUrl}
              onPress={() => setUploadType("pan")}
            />
          </View>
        </ScrollView>

        {/* FOOTER BUTTON */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            padding: 20,
            borderTopWidth: 1,
            borderColor: "#f3f4f6",
          }}
        >
          <TouchableOpacity
            onPress={goNext}
            disabled={!isComplete}
            style={{
              backgroundColor: isComplete ? "#2563eb" : "#d1d5db",
              paddingVertical: 18,
              borderRadius: 16,
              shadowColor: isComplete ? "#2563eb" : "transparent",
              shadowOpacity: 0.4,
              shadowOffset: { width: 0, height: 4 },
              elevation: isComplete ? 5 : 0,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: isComplete ? "#fff" : "#9ca3af",
              }}
            >
              Review & Submit →
            </Text>
          </TouchableOpacity>
        </View>

        {/* MODALS */}
        <BankPickerModal
          visible={bankModalVisible}
          onClose={() => setBankModalVisible(false)}
          onSelect={(bank) => setForm({ ...form, bankName: bank })}
        />

        {uploadType && (
          <UploadSheet
            type={uploadType}
            customerId={params.customerId}
            onClose={() => setUploadType(null)}
            onSuccess={handleUploadSuccess}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
