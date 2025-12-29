import { useAuth } from "@/context/AuthContext";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
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
  const { axiosAuth } = useAuth();
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

      // STEP 1: Create Investment (JSON)
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

      const res = await axiosAuth().post(invEndpoint, invPayload);
      const newInvestmentId = res.data.investmentId || res.data.id;

      // STEP 2: Upload Proof (FormData)
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
          
          const token = await AsyncStorage.getItem("rmclub_jwt");

          await axios.post("https://api.rmclub.co/api/payment-proofs", formData, {
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
            transformRequest: (data) => data,
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
    <Modal 
      visible={visible} 
      transparent 
      animationType="slide" 
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Invisible tap area to close modal if tapped outside */}
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} activeOpacity={1} />

        <KeyboardAvoidingView
           behavior={Platform.OS === "ios" ? "padding" : "height"}
           style={styles.keyboardView}
        >
          <View style={styles.container}>
            {/* --- Header --- */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>New Investment</Text>
                <Text style={styles.headerSubtitle}>Create a plan for customer</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Feather name="x" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* --- Scrollable Form --- */}
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {/* 1. Plan Type Selector */}
              <View style={styles.segmentContainer}>
                {["fd", "rd", "fd_plus"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setType(t)}
                    style={[
                      styles.segmentBtn,
                      type === t && styles.segmentBtnActive,
                    ]}
                  >
                    <Text style={[styles.segmentText, type === t && styles.segmentTextActive]}>
                      {t === "fd_plus" ? "FD Plus" : t.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 2. Amount Input (Hero) */}
              <View style={styles.heroInputContainer}>
                <Text style={styles.heroLabel}>
                  {type === "rd" ? "Monthly Installment" : "Principal Amount"}
                </Text>
                <View style={styles.amountWrapper}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.heroInput}
                    value={principalAmount}
                    onChangeText={setPrincipalAmount}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#cbd5e1"
                  />
                </View>
              </View>

              {/* 3. Date & Rate Row */}
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Start Date</Text>
                  <View style={styles.inputIconWrapper}>
                    <TextInput
                      style={styles.inputWithIcon}
                      value={startDate}
                      onChangeText={setStartDate}
                      placeholder="YYYY-MM-DD"
                    />
                    <Feather name="calendar" size={16} color="#94a3b8" style={styles.inputIconRight} />
                  </View>
                </View>
                
                {type !== "fd_plus" && (
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Interest Rate (%)</Text>
                    <TextInput
                      style={styles.input}
                      value={interestRate}
                      onChangeText={setInterestRate}
                      keyboardType="numeric"
                      placeholder="12.0"
                    />
                  </View>
                )}
              </View>

              {/* 4. Plan Specifics (Conditional) */}
              {type === "fd" && (
                <View style={styles.cardBox}>
                  <Text style={styles.cardTitle}>FD Configuration</Text>
                  <View style={styles.row}>
                    <View style={styles.halfInput}>
                      <Text style={styles.subLabel}>Lock-in (Months)</Text>
                      <TextInput
                        style={styles.inputWhite}
                        value={lockIn}
                        onChangeText={setLockIn}
                        keyboardType="numeric"
                        placeholder="12"
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={styles.subLabel}>Payout</Text>
                      <View style={styles.staticInput}>
                          <Text style={styles.staticInputText}>Monthly</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {type === "rd" && (
                <View style={[styles.cardBox, styles.rdBox]}>
                  <Text style={[styles.cardTitle, { color: "#047857" }]}>RD Configuration</Text>
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
                      <View style={styles.starIcon}>
                         <Feather name="star" size={14} color="#fff" />
                      </View>
                      <Text style={styles.fdPlusTitle}>FD+ FIXED PLAN</Text>
                  </View>
                  <View style={styles.bulletPoint}>
                    <Feather name="check-circle" size={16} color="#b45309" />
                    <Text style={styles.fdPlusText}>10% Guaranteed Return</Text>
                  </View>
                  <View style={styles.bulletPoint}>
                    <Feather name="check-circle" size={16} color="#b45309" />
                    <Text style={styles.fdPlusText}>20 Months Lock-in</Text>
                  </View>
                </View>
              )}

              <View style={styles.divider} />

              {/* 5. Payment & Proof */}
              <Text style={styles.sectionHeader}>Payment Details</Text>

              <Text style={styles.label}>Payment Method</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.methodScroll}>
                  {['bank_transfer', 'upi', 'cash', 'cheque'].map((method) => (
                      <TouchableOpacity
                          key={method}
                          onPress={() => setPaymentMethod(method)}
                          style={[
                              styles.pillBtn,
                              paymentMethod === method && styles.pillBtnActive
                          ]}
                      >
                          {paymentMethod === method && <Feather name="check" size={14} color="#2563eb" style={{marginRight:4}} />}
                          <Text style={[styles.pillText, paymentMethod === method && styles.pillTextActive]}>
                              {method.replace('_', ' ').toUpperCase()}
                          </Text>
                      </TouchableOpacity>
                  ))}
              </ScrollView>

              <Text style={styles.label}>Transaction Ref / UTR</Text>
              <TextInput
                style={styles.input}
                value={transactionId}
                onChangeText={setTransactionId}
                placeholder="Required for online payments"
              />

              <Text style={[styles.label, { marginTop: 16 }]}>
                  Upload Proof {paymentMethod !== 'cash' && '*'}
              </Text>
              
              <TouchableOpacity onPress={pickDocument} activeOpacity={0.8}>
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
                              File selected
                          </Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.trashBtn}
                        onPress={(e) => { e.stopPropagation(); setProofFile(null); }}
                      >
                          <Feather name="trash-2" size={18} color="#ef4444" />
                      </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.uploadBox}>
                      <Feather name="upload-cloud" size={28} color="#94a3b8" />
                      <Text style={styles.uploadText}>Tap to upload Receipt</Text>
                      <Text style={styles.uploadSubText}>Support: JPG, PNG, PDF</Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>

            {/* --- Footer --- */}
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
                     Create Investment
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// --- Premium Styles ---
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    width: '100%',
    height: '92%', // Takes up 92% of screen height
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    backgroundColor: "#f1f5f9",
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Segment Control
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    padding: 4,
    borderRadius: 12,
    marginBottom: 24,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  segmentTextActive: {
    color: "#0f172a",
    fontWeight: "700",
  },

  // Hero Input
  heroInputContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  amountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "600",
    color: "#0f172a",
    marginRight: 4,
  },
  heroInput: {
    fontSize: 36,
    fontWeight: "800",
    color: "#0f172a",
    minWidth: 100,
    textAlign: 'center',
    padding: 0,
  },

  // General Inputs
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
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0f172a",
  },
  inputIconWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputWithIcon: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 40,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0f172a",
  },
  inputIconRight: {
    position: 'absolute',
    right: 12,
  },

  // Card Styles (FD/RD)
  cardBox: {
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbeafe",
    marginBottom: 20,
  },
  rdBox: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: 12,
  },
  inputWhite: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    color: "#0f172a",
    textAlign: 'center',
  },
  staticInput: {
    backgroundColor: "rgba(255,255,255,0.5)",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 10,
    padding: 10,
    alignItems:'center',
    justifyContent:'center'
  },
  staticInputText: {
    fontWeight:'700', 
    color:'#2563eb',
    fontSize: 14
  },

  // FD Plus Special
  fdPlusBox: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  fdPlusHeader: {
    flexDirection:'row',
    alignItems:'center',
    gap: 8,
    marginBottom: 12
  },
  starIcon: {
    backgroundColor: "#d97706",
    padding: 4,
    borderRadius: 50,
  },
  fdPlusTitle: {
    color: "#92400e",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  fdPlusText: {
    color: "#92400e",
    fontSize: 14,
    fontWeight: '500'
  },

  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 16,
  },

  // Payment Pills
  methodScroll: {
    marginBottom: 16,
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#fff",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
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

  // Upload Box
  uploadBox: {
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderStyle: "dashed",
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginTop: 12,
  },
  uploadSubText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 12,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fileIcon: {
    width: 44,
    height: 44,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
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
  trashBtn: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },

  // Footer
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Safe area for iOS
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 5,
  },
  createBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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