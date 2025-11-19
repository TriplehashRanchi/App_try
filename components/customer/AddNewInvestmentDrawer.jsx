import Slider from "@react-native-community/slider";
import { useState } from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function AddNewInvestmentDrawer({ visible, onClose }) {
  const { axiosAuth } = useAuth();

  const [type, setType] = useState("fd");
  const [amount, setAmount] = useState("");
  const [months, setMonths] = useState(12);
  const [submitting, setSubmitting] = useState(false);

  const maxMonths = type === "fdplus" ? 20 : 60;

  const submitRequest = async () => {
    try {
      setSubmitting(true);

      const message = `
New Investment Request
Type: ${type.toUpperCase()}
Amount: ₹${amount}
Duration: ${months} months
      `;

      await axiosAuth().post("/queries", { message });

      onClose();
    } catch (err) {
      console.log("Query Error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>New Investment Request</Text>

          {/* TYPE */}
          <Text style={styles.label}>Select Type</Text>
          <View style={styles.typeRow}>
            {["fd", "rd", "fdplus"].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setType(item)}
                style={[
                  styles.typeButton,
                  type === item && styles.typeButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === item && styles.typeButtonTextActive,
                  ]}
                >
                  {item.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* AMOUNT */}
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter amount"
            value={amount}
            onChangeText={(v) => setAmount(v)}
          />

          {/* DURATION */}
          <Text style={styles.label}>Duration: {months} months</Text>
          <Slider
            style={{ width: "100%" }}
            minimumValue={type === "fdplus" ? 20 : 1}
            maximumValue={maxMonths}
            value={months}
            minimumTrackTintColor="#00b386"
            maximumTrackTintColor="#ccc"
            onValueChange={(v) => setMonths(Math.round(v))}
          />

          {/* BUTTONS */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={submitRequest}
              disabled={submitting}
            >
              <Text style={styles.submitText}>
                {submitting ? "Submitting..." : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    color: "#555",
    marginTop: 10,
  },

  typeRow: {
    flexDirection: "row",
    marginVertical: 8,
  },

  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 10,
  },
  typeButtonActive: {
    backgroundColor: "#00b386",
    borderColor: "#00b386",
  },
  typeButtonText: {
    color: "#444",
    fontWeight: "600",
  },
  typeButtonTextActive: {
    color: "#fff",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    fontSize: 16,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  cancelBtn: {
    padding: 14,
    flex: 1,
    marginRight: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
  },
  cancelText: {
    textAlign: "center",
    color: "#444",
    fontWeight: "600",
  },
  submitBtn: {
    padding: 14,
    flex: 1,
    backgroundColor: "#00b386",
    borderRadius: 10,
  },
  submitText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "700",
  },
});
