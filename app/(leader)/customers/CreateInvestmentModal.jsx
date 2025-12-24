import { useAuth } from "@/context/AuthContext";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Imports needed to bypass the interceptor for file upload
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function CreateInvestmentModal({
  visible,
  onClose,
  customerId,
  onCreated,
}) {
  const { axiosAuth } = useAuth(); // Keep this for the Create Investment step (JSON)
  const [loading, setLoading] = useState(false);

  // --- Form State ---
  const [type, setType] = useState("fd");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Specifics
  const [lockIn, setLockIn] = useState("");
  const [payoutFreq, setPayoutFreq] = useState("monthly");
  const [rdMonths, setRdMonths] = useState("");

  // --- Payment State ---
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [transactionId, setTransactionId] = useState("");
  const [proofFile, setProofFile] = useState(null);

  // --- Helpers ---
  const resetForm = () => {
    setPrincipalAmount("");
    setInterestRate("");
    setLockIn("");
    setRdMonths("");
    setType("fd");
    setStartDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("bank_transfer");
    setTransactionId("");
    setProofFile(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProofFile(result.assets[0]);
      }
    } catch (err) {
      console.log("Picker Error:", err);
    }
  };

  const validate = () => {
    if (!principalAmount) {
      Alert.alert("Missing Input", "Please enter the Amount.");
      return false;
    }
    if (!startDate) {
      Alert.alert("Missing Input", "Please enter a Start Date.");
      return false;
    }
    if (type === "fd" && (!interestRate || !lockIn)) {
      Alert.alert("Missing Input", "FD requires Interest Rate and Lock-in.");
      return false;
    }
    if (type === "rd" && (!interestRate || !rdMonths)) {
      Alert.alert("Missing Input", "RD requires Interest Rate and Months.");
      return false;
    }
    if (paymentMethod !== "cash" && !proofFile) {
      Alert.alert("Proof Required", "Please upload a proof document.");
      return false;
    }
    return true;
  };

  // --- MAIN LOGIC ---
  const handleCreateAndLog = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      // STEP 1: Create Investment (JSON) - Use axiosAuth (Interceptor is fine here)
      let invPayload = { customerId, principalAmount, startDate };
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

      console.log("Creating Investment...");
      const res = await axiosAuth().post(invEndpoint, invPayload);
      
      const newInvestmentId = res.data.investmentId || res.data.id;

      // STEP 2: Upload Proof (FormData) - BYPASS INTERCEPTOR
      // We use standard 'axios' here to prevent the Content-Type override issue.
      if (newInvestmentId) {
        try {
          const formData = new FormData();
          formData.append("investmentId", String(newInvestmentId));
          formData.append("amount", String(principalAmount));
          formData.append("paymentMethod", paymentMethod);
          if (transactionId) formData.append("transactionId", transactionId);
          formData.append("notes", "Created via App"); 

          if (proofFile) {
            formData.append("file", {
              uri: Platform.OS === 'android' ? proofFile.uri : proofFile.uri.replace('file://', ''),
              name: proofFile.name || `proof.jpg`,
              type: proofFile.mimeType || "image/jpeg",
            });
          }

          console.log("Uploading Proof (Direct Request)...");
          
          // Get Token Manually
          const token = await AsyncStorage.getItem("rmclub_jwt");

          // Direct Axios call to avoid global interceptor forcing JSON
          await axios.post("https://api.rmclub.co/api/payment-proofs", formData, {
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "multipart/form-data", // Standard Axios handles the boundary automatically
            },
            transformRequest: (data) => data, // Essential for React Native FormData
          });

        } catch (paymentErr) {
          console.log("Payment Log Error:", paymentErr);
          const errMsg = paymentErr?.response?.data?.message || "Upload failed";
          Alert.alert("Partial Success", `Investment created, but proof failed: ${errMsg}`);
          onCreated(res.data);
          handleClose();
          return;
        }
      }

      Alert.alert("Success", "Investment and Payment Proof created successfully!");
      onCreated(res.data);
      handleClose();

    } catch (err) {
      console.log("Creation Error:", err);
      const msg = err?.response?.data?.message || "Failed to create investment.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
             behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardView}
          >
            <View style={styles.container}>
              {/* --- Header --- */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>New Investment</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <Feather name="x" size={22} color="#475569" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent}
              >
                {/* --- 1. Investment Type --- */}
                <Text style={styles.label}>Select Plan Type</Text>
                <View style={styles.typeContainer}>
                  {["fd", "rd", "fd_plus"].map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setType(t)}
                      style={[
                        styles.typeBtn,
                        type === t && styles.typeBtnActive,
                      ]}
                    >
                      <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
                        {t === "fd_plus" ? "FD+" : t.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* --- 2. Basic Details --- */}
                <Text style={styles.label}>
                  {type === "rd" ? "Monthly Installment (₹)*" : "Principal Amount (₹)*"}
                </Text>
                <TextInput
                  style={styles.inputBig}
                  value={principalAmount}
                  onChangeText={setPrincipalAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#cbd5e1"
                />

                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.label}>Start Date</Text>
                    <TextInput
                      style={styles.input}
                      value={startDate}
                      onChangeText={setStartDate}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                  
                  {type !== "fd_plus" && (
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Interest Rate (%)</Text>
                      <TextInput
                        style={styles.input}
                        value={interestRate}
                        onChangeText={setInterestRate}
                        keyboardType="numeric"
                        placeholder="e.g. 12"
                      />
                    </View>
                  )}
                </View>

                {/* --- 3. Plan Specifics --- */}
                {type === "fd" && (
                  <View style={styles.detailsBox}>
                    <Text style={styles.boxTitle}>FD Configuration</Text>
                    <View style={styles.row}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.subLabel}>Lock-in (Months)</Text>
                        <TextInput
                          style={styles.inputWhite}
                          value={lockIn}
                          onChangeText={setLockIn}
                          keyboardType="numeric"
                          placeholder="12"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.subLabel}>Payout</Text>
                        <View style={styles.staticInput}>
                            <Text style={{fontWeight:'600', color:'#2563eb'}}>Monthly</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {type === "rd" && (
                  <View style={[styles.detailsBox, { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" }]}>
                    <Text style={[styles.boxTitle, { color: "#047857" }]}>RD Configuration</Text>
                    <Text style={styles.subLabel}>Total Duration (Months)</Text>
                    <TextInput
                      style={styles.inputWhite}
                      value={rdMonths}
                      onChangeText={setRdMonths}
                      keyboardType="numeric"
                      placeholder="e.g. 12"
                    />
                  </View>
                )}

                {type === "fd_plus" && (
                  <View style={styles.fdPlusBox}>
                    <View style={styles.fdPlusHeader}>
                        <Feather name="star" size={16} color="#b45309" />
                        <Text style={styles.fdPlusTitle}>FD+ FIXED PLAN</Text>
                    </View>
                    <Text style={styles.fdPlusText}>
                      • 10% Guaranteed Return{"\n"}
                      • 20 Months Lock-in{"\n"}
                      • Auto-Monthly Payouts
                    </Text>
                  </View>
                )}

                <View style={styles.divider} />

                {/* --- 4. PAYMENT DETAILS --- */}
                <Text style={styles.sectionHeader}>Payment & Proof</Text>

                <Text style={styles.label}>Payment Method</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 16}}>
                    {['bank_transfer', 'upi', 'cash', 'cheque'].map((method) => (
                        <TouchableOpacity
                            key={method}
                            onPress={() => setPaymentMethod(method)}
                            style={[
                                styles.pillBtn,
                                paymentMethod === method && styles.pillBtnActive
                            ]}
                        >
                            <Text style={[styles.pillText, paymentMethod === method && styles.pillTextActive]}>
                                {method.replace('_', ' ').toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.label}>Transaction ID / UTR / Cheque No.</Text>
                <TextInput
                  style={styles.input}
                  value={transactionId}
                  onChangeText={setTransactionId}
                  placeholder="Optional for Cash"
                />

                <Text style={[styles.label, { marginTop: 12 }]}>
                    Proof Document {paymentMethod !== 'cash' && '*'}
                </Text>
                
                <TouchableOpacity onPress={pickDocument} style={styles.uploadBox}>
                  {proofFile ? (
                    <View style={styles.filePreview}>
                        <View style={styles.fileIcon}>
                            <Feather name="file-text" size={24} color="#2563eb" />
                        </View>
                        <View style={{flex:1}}>
                            <Text style={styles.fileName} numberOfLines={1}>
                                {proofFile.name}
                            </Text>
                            <Text style={styles.fileSize}>
                                {(proofFile.size / 1024).toFixed(2)} KB
                            </Text>
                        </View>
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); setProofFile(null); }}>
                            <Feather name="trash-2" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                        <View style={styles.uploadIconCircle}>
                            <Feather name="upload-cloud" size={24} color="#64748b" />
                        </View>
                        <Text style={styles.uploadText}>Tap to upload Receipt</Text>
                        <Text style={styles.uploadSubText}>Images or PDF accepted</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity
                  disabled={loading}
                  onPress={handleCreateAndLog}
                  style={[styles.createBtn, loading && styles.btnDisabled]}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.createBtnText}>
                       Create & Log Payment
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// --- Styles (Same as before) ---
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  keyboardView: {
  flex: 1,
},
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 50,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#0f172a",
    marginBottom: 10,
  },
  inputBig: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 16,
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 20,
  },
  inputWhite: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    color: "#0f172a",
  },
  staticInput: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 10,
    padding: 12,
    alignItems:'center',
    justifyContent:'center'
  },
  typeContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 4,
    borderRadius: 14,
    marginBottom: 24,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  typeBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  typeTextActive: {
    color: "#2563eb",
    fontWeight: "700",
  },
  pillBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  pillBtnActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  pillTextActive: {
    color: "#2563eb",
  },
  detailsBox: {
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbeafe",
    marginBottom: 16,
  },
  boxTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: 12,
  },
  fdPlusBox: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  fdPlusHeader: {
    flexDirection:'row',
    alignItems:'center',
    gap: 6,
    marginBottom: 8
  },
  fdPlusTitle: {
    color: "#b45309",
    fontWeight: "800",
    fontSize: 14,
  },
  fdPlusText: {
    color: "#92400e",
    fontSize: 13,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 20,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  uploadPlaceholder: {
    alignItems: "center",
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  uploadSubText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 12,
  },
  fileIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  fileSize: {
    fontSize: 12,
    color: "#64748b",
  },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  createBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  btnDisabled: {
    backgroundColor: "#94a3b8",
    shadowOpacity: 0,
  },
  createBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});