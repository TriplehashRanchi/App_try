import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

const planTypes = [
  { key: "fd", label: "FD", icon: "trending-up" },
  { key: "rd", label: "RD", icon: "repeat" },
  { key: "fd_plus", label: "FD Plus", icon: "star" },
];

const paymentMethods = ["bank_transfer", "upi", "cash", "cheque"];

const goToCustomerDetail = (customerId) => {
  router.replace({
    pathname: "/(leader)/customers/[id]",
    params: { id: customerId },
  });
};

export default function AddInvestmentPage() {
  const params = useLocalSearchParams();
  const customerId = Array.isArray(params.customerId)
    ? params.customerId[0]
    : params.customerId;
  const { axiosAuth } = useAuth();

  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("fd");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [lockIn, setLockIn] = useState("");
  const [payoutFreq] = useState("monthly");
  const [rdMonths, setRdMonths] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [transactionId, setTransactionId] = useState("");
  const [proofFiles, setProofFiles] = useState([]);

  const resetForm = () => {
    setType("fd");
    setPrincipalAmount("");
    setInterestRate("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setLockIn("");
    setRdMonths("");
    setPaymentMethod("bank_transfer");
    setTransactionId("");
    setProofFiles([]);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setProofFiles((prev) => [...prev, ...result.assets]);
      }
    } catch (err) {
      console.log("Picker Error:", err);
      Alert.alert("Upload failed", "Could not open the document picker.");
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setProofFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const validate = () => {
    if (!customerId) {
      Alert.alert("Customer missing", "Please open this from a customer profile.");
      return false;
    }

    if (!principalAmount) {
      Alert.alert("Missing Input", "Please enter the amount.");
      return false;
    }

    if (!startDate) {
      Alert.alert("Missing Input", "Please enter a start date.");
      return false;
    }

    if (type === "fd" && (!interestRate || !lockIn)) {
      Alert.alert("Missing Input", "FD requires interest rate and lock-in.");
      return false;
    }

    if (type === "rd" && (!interestRate || !rdMonths)) {
      Alert.alert("Missing Input", "RD requires interest rate and months.");
      return false;
    }

    if (paymentMethod !== "cash" && proofFiles.length === 0) {
      Alert.alert("Proof Required", "Please upload a proof document.");
      return false;
    }

    return true;
  };

  const handleCreateAndLog = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const invPayload = { customerId, principalAmount, startDate };
      let invEndpoint = "";

      if (type === "fd") {
        invEndpoint = "/investments/fd";
        invPayload.interestRate = parseFloat(interestRate) / 100;
        invPayload.lockInPeriodMonths = lockIn;
        invPayload.interestPayoutFrequency = payoutFreq;
      } else if (type === "rd") {
        invEndpoint = "/investments/rd/standard";
        invPayload.interestRate = parseFloat(interestRate) / 100;
        invPayload.rdPeriodMonths = rdMonths;
      } else if (type === "fd_plus") {
        invEndpoint = "/investments/fd-plus";
      }

      const res = await axiosAuth().post(invEndpoint, invPayload);
      const newInvestmentId = res.data.investmentId || res.data.id;

      if (newInvestmentId) {
        try {
          const formData = new FormData();
          formData.append("investmentId", String(newInvestmentId));
          formData.append("amount", String(principalAmount));
          formData.append("paymentMethod", paymentMethod);
          if (transactionId) formData.append("transactionId", transactionId);
          formData.append("notes", "Created via App");

          proofFiles.forEach((file, index) => {
            formData.append("files", {
              uri:
                Platform.OS === "android"
                  ? file.uri
                  : file.uri.replace("file://", ""),
              name: file.name || `proof-${index + 1}.jpg`,
              type: file.mimeType || "image/jpeg",
            });
          });

          const token = await AsyncStorage.getItem("rmclub_jwt");

          await axios.post("https://api.rmclub.co/api/payment-proofs", formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            transformRequest: (data) => data,
          });
        } catch (paymentErr) {
          console.log("Payment Log Error:", paymentErr);
          const errMsg =
            paymentErr?.response?.data?.message || "Upload failed";
          Alert.alert(
            "Partial Success",
            `Investment created, but proof failed: ${errMsg}`,
            [
              {
                text: "OK",
                onPress: () => {
                  resetForm();
                  goToCustomerDetail(customerId);
                },
              },
            ]
          );
          return;
        }
      }

      Alert.alert("Success", "Investment and payment proof created.", [
        {
          text: "OK",
          onPress: () => {
            resetForm();
            goToCustomerDetail(customerId);
          },
        },
      ]);
    } catch (err) {
      console.log("Creation Error:", err);
      const msg = err?.response?.data?.message || "Failed to create investment.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={22} color="#0f172a" />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>New Investment</Text>
            <Text style={styles.headerSubtitle}>Create a customer plan</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Plan type</Text>
            <View style={styles.planGrid}>
              {planTypes.map((plan) => {
                const active = type === plan.key;

                return (
                  <TouchableOpacity
                    key={plan.key}
                    onPress={() => setType(plan.key)}
                    style={[styles.planCard, active && styles.planCardActive]}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.planIcon,
                        active && styles.planIconActive,
                      ]}
                    >
                      <Feather
                        name={plan.icon}
                        size={18}
                        color={active ? "#fff" : "#2563eb"}
                      />
                    </View>
                    <Text
                      style={[
                        styles.planLabel,
                        active && styles.planLabelActive,
                      ]}
                    >
                      {plan.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>
              {type === "rd" ? "Monthly Installment" : "Principal Amount"}
            </Text>
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={principalAmount}
                onChangeText={setPrincipalAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Plan details</Text>
            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>Start Date</Text>
                <View style={styles.inputWithIconWrap}>
                  <TextInput
                    style={styles.inputWithIcon}
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94a3b8"
                  />
                  <Feather
                    name="calendar"
                    size={16}
                    color="#64748b"
                    style={styles.inputIcon}
                  />
                </View>
              </View>

              {type !== "fd_plus" && (
                <View style={styles.field}>
                  <Text style={styles.label}>Interest Rate (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={interestRate}
                    onChangeText={setInterestRate}
                    keyboardType="numeric"
                    placeholder="12.0"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              )}
            </View>

            {type === "fd" && (
              <View style={styles.configBox}>
                <View style={styles.row}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Lock-in (Months)</Text>
                    <TextInput
                      style={styles.input}
                      value={lockIn}
                      onChangeText={setLockIn}
                      keyboardType="numeric"
                      placeholder="12"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>Payout</Text>
                    <View style={styles.readOnlyInput}>
                      <Text style={styles.readOnlyText}>Monthly</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {type === "rd" && (
              <View style={styles.configBox}>
                <Text style={styles.label}>Total Duration (Months)</Text>
                <TextInput
                  style={styles.input}
                  value={rdMonths}
                  onChangeText={setRdMonths}
                  keyboardType="numeric"
                  placeholder="e.g. 12"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            )}

            {type === "fd_plus" && (
              <View style={styles.fdPlusBox}>
                <View style={styles.fdPlusTitleRow}>
                  <View style={styles.starIcon}>
                    <Feather name="star" size={14} color="#fff" />
                  </View>
                  <Text style={styles.fdPlusTitle}>FD+ Fixed Plan</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Feather name="check-circle" size={16} color="#b45309" />
                  <Text style={styles.fdPlusText}>10% guaranteed return</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Feather name="check-circle" size={16} color="#b45309" />
                  <Text style={styles.fdPlusText}>20 months lock-in</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment details</Text>

            <Text style={styles.label}>Payment Method</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.methodScroll}
            >
              {paymentMethods.map((method) => {
                const active = paymentMethod === method;

                return (
                  <TouchableOpacity
                    key={method}
                    onPress={() => setPaymentMethod(method)}
                    style={[styles.pillBtn, active && styles.pillBtnActive]}
                  >
                    {active && (
                      <Feather
                        name="check"
                        size={14}
                        color="#2563eb"
                        style={styles.pillIcon}
                      />
                    )}
                    <Text
                      style={[styles.pillText, active && styles.pillTextActive]}
                    >
                      {method.replace("_", " ").toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.label}>Transaction Ref / UTR</Text>
            <TextInput
              style={styles.input}
              value={transactionId}
              onChangeText={setTransactionId}
              placeholder="Required for online payments"
              placeholderTextColor="#94a3b8"
            />

            <Text style={[styles.label, styles.uploadLabel]}>
              Upload Proof {paymentMethod !== "cash" && "*"}
            </Text>

            <TouchableOpacity onPress={pickDocument} activeOpacity={0.85}>
              <View style={styles.uploadBox}>
                <View style={styles.uploadIconWrap}>
                  <Feather name="upload-cloud" size={26} color="#2563eb" />
                </View>
                <Text style={styles.uploadText}>Upload payment receipt</Text>
                <Text style={styles.uploadSubText}>JPG, PNG, or PDF</Text>
                {proofFiles.length > 0 && (
                  <Text style={styles.uploadCount}>
                    {proofFiles.length} file(s) selected
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {proofFiles.length > 0 && (
              <View style={styles.fileList}>
                {proofFiles.map((file, index) => (
                  <View key={`${file.uri}-${index}`} style={styles.filePreview}>
                    <View style={styles.fileIcon}>
                      <Feather name="file-text" size={22} color="#2563eb" />
                    </View>
                    <View style={styles.fileTextWrap}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {file.name || `Proof ${index + 1}`}
                      </Text>
                      <Text style={styles.fileSize}>
                        {file.size
                          ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                          : "File selected"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.trashBtn}
                      onPress={() => handleRemoveFile(index)}
                    >
                      <Feather name="trash-2" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            disabled={loading}
            onPress={handleCreateAndLog}
            style={[styles.createBtn, loading && styles.btnDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="check-circle" size={18} color="#fff" />
                <Text style={styles.createBtnText}>Create Investment</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0f172a",
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748b",
  },
  headerSpacer: {
    width: 42,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 14,
  },
  planGrid: {
    flexDirection: "row",
    gap: 10,
  },
  planCard: {
    flex: 1,
    minHeight: 84,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  planCardActive: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  planIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  planIconActive: {
    backgroundColor: "#2563eb",
  },
  planLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  planLabelActive: {
    color: "#1d4ed8",
  },
  amountCard: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#cbd5e1",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 34,
    fontWeight: "700",
    color: "#fff",
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    color: "#fff",
    fontSize: 36,
    fontWeight: "800",
    padding: 0,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  field: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0f172a",
  },
  inputWithIconWrap: {
    position: "relative",
    justifyContent: "center",
  },
  inputWithIcon: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingLeft: 14,
    paddingRight: 40,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0f172a",
  },
  inputIcon: {
    position: "absolute",
    right: 12,
  },
  configBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  readOnlyInput: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  readOnlyText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2563eb",
  },
  fdPlusBox: {
    marginTop: 16,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderRadius: 14,
    padding: 14,
  },
  fdPlusTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  starIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#d97706",
    alignItems: "center",
    justifyContent: "center",
  },
  fdPlusTitle: {
    color: "#92400e",
    fontWeight: "800",
    fontSize: 14,
  },
  bulletPoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  fdPlusText: {
    color: "#92400e",
    fontSize: 14,
    fontWeight: "600",
  },
  methodScroll: {
    marginBottom: 16,
  },
  pillBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: "#f8fafc",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  pillBtnActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
  },
  pillIcon: {
    marginRight: 4,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  pillTextActive: {
    color: "#2563eb",
  },
  uploadLabel: {
    marginTop: 16,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: "#bfdbfe",
    borderStyle: "dashed",
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    padding: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1e3a8a",
    marginTop: 12,
  },
  uploadSubText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  uploadCount: {
    fontSize: 12,
    color: "#2563eb",
    marginTop: 8,
    fontWeight: "700",
  },
  fileList: {
    marginTop: 12,
    gap: 8,
  },
  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 12,
  },
  fileIcon: {
    width: 42,
    height: 42,
    backgroundColor: "#dbeafe",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  fileTextWrap: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  fileSize: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748b",
  },
  trashBtn: {
    padding: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
  },
  createBtn: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  btnDisabled: {
    backgroundColor: "#94a3b8",
  },
  createBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
