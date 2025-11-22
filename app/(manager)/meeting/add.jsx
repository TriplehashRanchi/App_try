"use client";

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import Toast from "react-native-toast-message";

export default function AddMeeting() {
  const router = useRouter();
  const { axiosAuth } = useAuth();

  // FORM STATE
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const [duration, setDuration] = useState("30");
  const [locationType, setLocationType] = useState("office");
  const [locationDetails, setLocationDetails] = useState("");

  const [participants, setParticipants] = useState([]);
  const [pName, setPName] = useState("");
  const [pContact, setPContact] = useState("");

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // ADD PARTICIPANT
  const addParticipant = () => {
    if (!pName.trim() || !pContact.trim()) {
      Toast.show({ type: "error", text1: "Name & Email/Phone required" });
      return;
    }

    setParticipants([
      ...participants,
      { name: pName, phone: pContact, email: pContact },
    ]);
    setPName("");
    setPContact("");
  };

  const removeParticipant = (i) => {
    setParticipants(participants.filter((_, index) => index !== i));
  };

  // CREATE MEETING
  const createMeeting = async () => {
    if (!title.trim()) {
      Toast.show({ type: "error", text1: "Title is required" });
      return;
    }
    if (participants.length === 0) {
      Toast.show({ type: "error", text1: "At least 1 participant required" });
      return;
    }

    const payload = {
      title,
      meeting_date: date.toISOString(),
      duration_minutes: Number(duration),
      location_type: locationType,
      location_details: locationDetails,
      participants,
      description: notes,
    };

    try {
      setLoading(true);
      await axiosAuth().post("/meetings", payload);

      Toast.show({
        type: "success",
        text1: "Meeting created successfully!",
      });

      router.push("/meeting");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Failed to create meeting",
      });
      console.log("MEETING ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Meeting</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* TITLE */}
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter meeting title"
          value={title}
          onChangeText={setTitle}
        />

        {/* DATE & TIME */}
        <View style={styles.row2}>
          <View style={{ width: "60%" }}>
            <Text style={styles.label}>Date & Time</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDate(true)}
            >
              <Text>
                {date.toLocaleDateString()} —{" "}
                {date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>

            {showDate && (
              <DateTimePicker
                value={date}
                mode="date"
                onChange={(e, selected) => {
                  setShowDate(false);
                  if (selected) {
                    const updated = new Date(date);
                    updated.setFullYear(selected.getFullYear());
                    updated.setMonth(selected.getMonth());
                    updated.setDate(selected.getDate());
                    setDate(updated);
                    setShowTime(true);
                  }
                }}
              />
            )}

            {showTime && (
              <DateTimePicker
                value={date}
                mode="time"
                onChange={(e, selected) => {
                  setShowTime(false);
                  if (selected) {
                    const updated = new Date(date);
                    updated.setHours(selected.getHours());
                    updated.setMinutes(selected.getMinutes());
                    setDate(updated);
                  }
                }}
              />
            )}
          </View>

     

          {/* DURATION */}
          <View style={{ width: "37%" }}>
            <Text style={styles.label}>Duration (min)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />
          </View>
        </View>

        {/* LOCATION TYPE */}
        <Text style={styles.label}>Location Type</Text>
        <View style={styles.rowButtons}>
          {["office", "online"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeBtn,
                locationType === type && styles.typeBtnActive,
              ]}
              onPress={() => setLocationType(type)}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  locationType === type && styles.typeBtnTextActive,
                ]}
              >
                {type === "office" ? "Office" : "Online"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* LOCATION DETAILS */}
        <Text style={styles.label}>Location Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Google Meet link or address"
          value={locationDetails}
          onChangeText={setLocationDetails}
        />

        {/* PARTICIPANTS */}
        <Text style={styles.label}>Participants</Text>
        <View style={[styles.row22, { marginBottom: 10 }]}>
          <TextInput
            value={pName}
            onChangeText={setPName}
            placeholder="Name"
            style={[styles.input, { flex: 1 }]}
          />
          <View style={{ width: 10 }} />
          <TextInput
            value={pContact}
            onChangeText={setPContact}
            placeholder="Email or Phone"
            style={[styles.input, { flex: 1 }]}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addParticipant}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {participants.map((p, i) => (
          <View key={i} style={styles.participantRow}>
            <Text style={styles.participantText}>
              {p.name} — {p.phone}
            </Text>
            <TouchableOpacity onPress={() => removeParticipant(i)}>
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}

        {/* NOTES */}
        <Text style={styles.label}>Agenda / Notes</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        {/* SUBMIT BUTTON */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
            onPress={createMeeting}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading ? "Creating..." : "Create Meeting"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// -------------------------------
// STYLES
// -------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingHorizontal: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: "#222",
  },

  headerTitle: { fontSize: 16, fontWeight: "600", color: "#222" },

  label: { marginTop: 14, marginBottom: 6, fontWeight: "600", color: "#111" },

  input: {
    backgroundColor: "#EFF1F5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },

  row2: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
    gap: 10,
  },
  row22: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
    
  },

  rowButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },

  typeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
  },

  typeBtnActive: {
    backgroundColor: "#387AFF",
  },

  typeBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  typeBtnTextActive: {
    color: "#fff",
  },

  addBtn: {
    width: 42,
    height: 42,
    backgroundColor: "#387AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },

  participantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    
  },

  participantText: { fontSize: 14 },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  submitBtn: {
    backgroundColor: "#387AFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 30,
    width: "48%",
  },

  submitText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 30,
    width: "48%",
    borderWidth: 1,
    borderColor: "#387AFF",
  },

  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#387AFF",
  },
});
