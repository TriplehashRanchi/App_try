import { useAuth } from "@/context/AuthContext";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function CreateInvestmentModal({
  visible,
  onClose,
  customerId,
  onCreated,
}) {
  const { axiosAuth } = useAuth();

  const [type, setType] = useState("fd");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [lockIn, setLockIn] = useState("");
  const [rdMonths, setRdMonths] = useState("");
  const [payoutFreq, setPayoutFreq] = useState("monthly");
  const [loading, setLoading] = useState(false);

  const createInvestment = async () => {
    try {
      setLoading(true);

      let payload = { customerId, principalAmount, startDate };
      let endpoint = "";

      if (type === "fd") {
        endpoint = "/investments/fd";
        payload.interestRate = parseFloat(interestRate) / 100;
        payload.lockInPeriodMonths = lockIn;
        payload.interestPayoutFrequency = payoutFreq;
      }

      if (type === "rd") {
        endpoint = "/investments/rd/standard";
        payload.interestRate = parseFloat(interestRate) / 100;
        payload.rdPeriodMonths = rdMonths;
      }

      if (type === "fd_plus") {
        endpoint = "/investments/fd-plus";
      }

      const res = await axiosAuth().post(endpoint, payload);

      onCreated(res.data);
      onClose();
    } catch (err) {
      console.log("Investment error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 20,
            maxHeight: "85%",
          }}
        >
          {/* HEADER */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "700" }}>
              New Investment
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* TYPE BUTTONS */}
            <Text style={{ fontWeight: "600", marginBottom: 6 }}>
              Investment Type
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
              {["fd", "rd", "fd_plus"].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 10,
                    backgroundColor:
                      type === t ? "#2563eb" : "#f3f4f6",
                  }}
                >
                  <Text
                    style={{
                      color: type === t ? "#fff" : "#111",
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    {t.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* PRINCIPAL */}
            <Text style={{ fontWeight: "600" }}>
              Principal Amount*
            </Text>
            <TextInput
              value={principalAmount}
              onChangeText={setPrincipalAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
              style={inputStyle}
            />

            {/* INTEREST */}
            {type !== "fd_plus" && (
              <>
                <Text style={{ fontWeight: "600", marginTop: 14 }}>
                  Interest Rate (%)
                </Text>
                <TextInput
                  value={interestRate}
                  onChangeText={setInterestRate}
                  keyboardType="numeric"
                  placeholder="Eg: 5"
                  style={inputStyle}
                />
              </>
            )}

            {/* START DATE */}
            <Text style={{ fontWeight: "600", marginTop: 14 }}>
              Start Date
            </Text>
            <TextInput
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              style={inputStyle}
            />

            {/* FD */}
            {type === "fd" && (
              <View style={{ marginTop: 18 }}>
                <Text style={{ fontWeight: "700", marginBottom: 6 }}>
                  FD Details
                </Text>

                <Text style={{ fontWeight: "600" }}>
                  Lock-in Period (Months)
                </Text>
                <TextInput
                  keyboardType="numeric"
                  value={lockIn}
                  onChangeText={setLockIn}
                  placeholder="Eg. 12"
                  style={inputStyle}
                />

                <Text style={{ fontWeight: "600", marginTop: 12 }}>
                  Interest Payout
                </Text>

                <TouchableOpacity
                  onPress={() => setPayoutFreq("monthly")}
                  style={payoutFreq === "monthly" ? activeBtn : inactiveBtn}
                >
                  <Text
                    style={
                      payoutFreq === "monthly"
                        ? activeText
                        : inactiveText
                    }
                  >
                    Monthly
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* RD */}
            {type === "rd" && (
              <View style={{ marginTop: 18 }}>
                <Text style={{ fontWeight: "700", marginBottom: 6 }}>
                  RD Details
                </Text>

                <Text style={{ fontWeight: "600" }}>
                  Period (Months)
                </Text>
                <TextInput
                  keyboardType="numeric"
                  value={rdMonths}
                  onChangeText={setRdMonths}
                  placeholder="Eg. 12"
                  style={inputStyle}
                />
              </View>
            )}

            {/* FD+ */}
            {type === "fd_plus" && (
              <View
                style={{
                  backgroundColor: "#fef3c7",
                  padding: 14,
                  marginTop: 18,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#fcd34d",
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    color: "#b45309",
                    marginBottom: 4,
                  }}
                >
                  FD+ PLAN (10% FIXED)
                </Text>
                <Text style={{ color: "#78350f" }}>
                  • Guaranteed 10% return  
                  • 20-month duration  
                  • Automatic monthly payouts  
                </Text>
              </View>
            )}

            {/* SAVE */}
            <TouchableOpacity
              disabled={loading}
              onPress={createInvestment}
              style={{
                backgroundColor: "#2563eb",
                paddingVertical: 14,
                borderRadius: 12,
                marginTop: 26,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                {loading ? "Saving..." : "Create Investment"}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const inputStyle = {
  backgroundColor: "#f3f4f6",
  borderRadius: 10,
  padding: 12,
  marginTop: 6,
  borderWidth: 1,
  borderColor: "#e5e7eb",
};

const activeBtn = {
  backgroundColor: "#2563eb",
  paddingVertical: 8,
  paddingHorizontal: 18,
  borderRadius: 10,
};

const inactiveBtn = {
  backgroundColor: "#e5e7eb",
  paddingVertical: 8,
  paddingHorizontal: 18,
  borderRadius: 10,
};

const activeText = { color: "#fff", fontWeight: "700" };
const inactiveText = { color: "#374151", fontWeight: "600" };
