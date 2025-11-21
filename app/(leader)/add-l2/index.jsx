import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFormik } from "formik";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import * as Yup from "yup";

// --- Imports ---
import { INDIAN_BANKS } from "@/constants/banks";
// Make sure your UploadSheet is saved in components/leader/UploadSheet.jsx
import GenericUploadWidgetRN from "@/components/leader/GenericUploadWidgetRN";

// ====================================================================
// 1. COMPONENTS (Inputs & Rows)
// ====================================================================

const PremiumInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  onBlur,
  keyboardType = "default",
  secureTextEntry,
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
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      maxLength={maxLength}
      autoCapitalize="none"
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

// ====================================================================
// 2. MAIN SCREEN
// ====================================================================

export default function AddL2LeaderPage() {
  const router = useRouter();
  const { axiosAuth } = useAuth();

  // State
  const [leaderId, setLeaderId] = useState(null); // Initially Null. When set, view switches to Uploads.
  const [loading, setLoading] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [uploadType, setUploadType] = useState(null); // Controls the bottom sheet

  // Track Uploaded URLs
  const [uploads, setUploads] = useState({
    aadharFrontUrl: "",
    aadharBackUrl: "",
    panUrl: "",
    bankProofUrl: "",
  });

  // Handle upload success from Sheet
  const handleUploadSuccess = (type, url) => {
  const keyMap = {
    aadharFront: "aadharFrontUrl",
    aadharBack: "aadharBackUrl",
    pan: "panUrl",
    passbook: "bankProofUrl", // ⭐ FIX HERE
  };
  console.log("Upload Success:", type, url);

  const correctKey = keyMap[type];
  if (!correctKey) return console.warn("Unknown upload type:", type);
console.log("Correct Key:", correctKey);
  setUploads((prev) => ({
    ...prev,
    [correctKey]: url,
  }));

  setUploadType(null);
};

  // --- FORMIK SETUP ---
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string()
        .min(8, "Min 8 chars")
        .required("Password is required"),
      bankName: Yup.string().required("Bank name required"),
      accountNumber: Yup.string().required("Account number required"),
      ifscCode: Yup.string().required("IFSC code required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          ...values,
          leaderType: "L2", // Force L2 creation
          uploads: {}, // Empty for now
        };

        // 1. Create Leader via API
        const { data } = await axiosAuth().post("/leaders/l2", payload);
        if (data.leaderId) {
          setLeaderId(data.leaderId);
        } else {
          Alert.alert("Error", "Server did not return leaderId.");
          return;
        }

        Alert.alert(
          "Success",
          "L2 Leader Created! Please upload the required documents now."
        );
      } catch (err) {
        console.error(err);
        Alert.alert(
          "Error",
          err?.response?.data?.message || "Failed to create leader."
        );
      } finally {
        setLoading(false);
      }
    },
  });

  // Completion Check
  const allDocsUploaded =
    uploads.aadharFrontUrl &&
    uploads.aadharBackUrl &&
    uploads.panUrl &&
    uploads.bankProofUrl;

  const finishOnboarding = () => {
    Alert.alert(
      "Onboarding Complete",
      "The L2 Leader has been successfully created and documents uploaded.",
      [{ text: "Go Home", onPress: () => router.replace("/(leader)") }]
    );
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
            padding: 20,
            borderBottomWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#111" }}>
            {leaderId ? "Upload Documents" : "Create L2 Leader"}
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
            {leaderId ? "Step 2: Verification" : "Step 1: Basic Information"}
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          {/* ================= STEP 1: FORM (Show if no leaderId) ================= */}
          {!leaderId && (
            <View
              style={{
                backgroundColor: "#fff",
                padding: 20,
                borderRadius: 16,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <PremiumInput
                    label="First Name"
                    placeholder="John"
                    value={formik.values.firstName}
                    onChangeText={formik.handleChange("firstName")}
                    onBlur={formik.handleBlur("firstName")}
                    error={formik.touched.firstName && formik.errors.firstName}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <PremiumInput
                    label="Last Name"
                    placeholder="Doe"
                    value={formik.values.lastName}
                    onChangeText={formik.handleChange("lastName")}
                    onBlur={formik.handleBlur("lastName")}
                    error={formik.touched.lastName && formik.errors.lastName}
                  />
                </View>
              </View>

              <PremiumInput
                label="Email Address"
                placeholder="john@example.com"
                value={formik.values.email}
                onChangeText={formik.handleChange("email")}
                onBlur={formik.handleBlur("email")}
                keyboardType="email-address"
                error={formik.touched.email && formik.errors.email}
              />

              <PremiumInput
                label="Password"
                placeholder="Create Password"
                value={formik.values.password}
                onChangeText={formik.handleChange("password")}
                onBlur={formik.handleBlur("password")}
                secureTextEntry
                error={formik.touched.password && formik.errors.password}
              />

              {/* Bank Selection */}
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
                      color: formik.values.bankName ? "#111" : "#9ca3af",
                    }}
                  >
                    {formik.values.bankName || "Select Bank"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
                {formik.touched.bankName && formik.errors.bankName && (
                  <Text
                    style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}
                  >
                    {formik.errors.bankName}
                  </Text>
                )}
              </View>

              <PremiumInput
                label="Account Number"
                placeholder="Enter Account No"
                value={formik.values.accountNumber}
                onChangeText={formik.handleChange("accountNumber")}
                onBlur={formik.handleBlur("accountNumber")}
                keyboardType="numeric"
                error={
                  formik.touched.accountNumber && formik.errors.accountNumber
                }
              />

              <PremiumInput
                label="IFSC Code"
                placeholder="SBIN000XXXX"
                value={formik.values.ifscCode}
                onChangeText={(text) =>
                  formik.setFieldValue("ifscCode", text.toUpperCase())
                }
                onBlur={formik.handleBlur("ifscCode")}
                maxLength={11}
                error={formik.touched.ifscCode && formik.errors.ifscCode}
              />
            </View>
          )}

          {/* ================= STEP 2: UPLOADS (Show if leaderId exists) ================= */}
          {leaderId && (
            <View
              style={{
                backgroundColor: "#fff",
                padding: 20,
                borderRadius: 16,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  marginBottom: 15,
                  color: "#374151",
                }}
              >
                KYC & Bank Proof
              </Text>

              <UploadRow
                label="Aadhar Front"
                url={uploads.aadharFrontUrl}
                onPress={() => setUploadType("aadharFront")}
                icon="id-card-outline"
              />
              <UploadRow
                label="Aadhar Back"
                url={uploads.aadharBackUrl}
                onPress={() => setUploadType("aadharBack")}
                icon="id-card-outline"
              />
              <UploadRow
                label="PAN Card"
                url={uploads.panUrl}
                onPress={() => setUploadType("pan")}
                icon="card-outline"
              />
              <UploadRow
                label="Bank Proof (Passbook)"
                url={uploads.bankProofUrl}
                onPress={() => setUploadType("passbook")}
                icon="document-text-outline"
              />
            </View>
          )}
        </ScrollView>

        {/* FOOTER ACTION BUTTONS */}
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
          {!leaderId ? (
            <TouchableOpacity
              onPress={formik.handleSubmit}
              disabled={loading}
              style={{
                backgroundColor: "#2563eb",
                paddingVertical: 16,
                borderRadius: 14,
                alignItems: "center",
                shadowColor: "#2563eb",
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 4,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}
                >
                  Create Leader →
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={finishOnboarding}
              disabled={!allDocsUploaded}
              style={{
                backgroundColor: allDocsUploaded ? "#16a34a" : "#d1d5db",
                paddingVertical: 16,
                borderRadius: 14,
                alignItems: "center",
                shadowColor: allDocsUploaded ? "#16a34a" : "transparent",
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 4,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
                Finish Onboarding ✓
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* MODALS */}
        <BankPickerModal
          visible={bankModalVisible}
          onClose={() => setBankModalVisible(false)}
          onSelect={(bank) => formik.setFieldValue("bankName", bank)}
        />

        <GenericUploadWidgetRN
          visible={!!uploadType}
          onClose={() => setUploadType(null)}
          label={
            uploadType === "aadharFront"
              ? "Upload Aadhaar Front"
              : uploadType === "aadharBack"
              ? "Upload Aadhaar Back"
              : uploadType === "pan"
              ? "Upload PAN Card"
              : "Upload Bank Proof"
          }
          endpoint={
            uploadType
              ? `/leaders/upload?leaderId=${leaderId}&type=${
                  uploadType === "aadharFront"
                    ? "aadhar_front"
                    : uploadType === "aadharBack"
                    ? "aadhar_back"
                    : uploadType === "pan"
                    ? "pan"
                    : "passbook"
                }`
              : ""
          }
          type={uploadType} // <-- ADD THIS
          onSuccess={handleUploadSuccess} // <-- FIX THIS
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
