"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import Toast from "react-native-toast-message";
import dayjs from "dayjs";

export default function EditMeeting() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { axiosAuth } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // FORM FIELDS
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [duration, setDuration] = useState("30");
  const [locationType, setLocationType] = useState("office");
  const [locationDetails, setLocationDetails] = useState("");
  const [notes, setNotes] = useState("");

  const [participants, setParticipants] = useState([]);
  const [pName, setPName] = useState("");
  const [pContact, setPContact] = useState("");

  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  // FETCH MEETING DETAILS
  useEffect(() => {
    loadMeeting();
  }, [id]);


  const parseDescriptionAndNotes = (raw) => {
  if (!raw) return { description: "", notes: [] };

  const parts = raw.split("📝").map(p => p.trim()).filter(Boolean);
  const description = parts[0]; // first block always description

  const notes = parts.slice(1).map(n =>
    n.replace(/\[Note.*?\]:\s*/, "").trim()
  );

  return { description, notes };
};

  const loadMeeting = async () => {
  try {
    const { data } = await axiosAuth().get(`/meetings/${id}`);

    const parsedParticipants =
      typeof data.participants === "string"
        ? JSON.parse(data.participants)
        : data.participants || [];

    const { description, notes } = parseDescriptionAndNotes(data.description);

    setTitle(data.title);
    setDate(new Date(data.meeting_date));
    setDuration(String(data.duration_minutes));
    setLocationType(data.location_type);
    setLocationDetails(data.location_details || "");

    // 👇 Final cleaned notes = description + all notes text
    setNotes(description + "\n\n" + notes.join("\n"));

    setParticipants(parsedParticipants);
  } catch (err) {
    Toast.show({ type: "error", text1: "Failed to load meeting" });
    console.log(err);
  } finally {
    setLoading(false);
  }
};


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

  // REMOVE PARTICIPANT
  const removeParticipant = (i) => {
    setParticipants(participants.filter((_, idx) => idx !== i));
  };

  // SAVE MEETING
  const saveChanges = async () => {
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
      description: notes,
      participants,
    };

    try {
      setSaving(true);
      await axiosAuth().put(`/meetings/${id}`, payload);

      Toast.show({
        type: "success",
        text1: "Meeting updated successfully!",
      });

      router.push(`/meeting/${id}`);
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to update meeting" });
      console.log(err);
    } finally {
      setSaving(false);
    }
  };
 

  

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Edit Meeting</Text>
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

        {/* DATE + TIME */}
        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Date & Time</Text>

            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDate(true)}
            >
              <Text>
                {dayjs(date).format("DD MMM YYYY — hh:mm A")}
              </Text>
            </TouchableOpacity>

            {showDate && (
              <DateTimePicker
                value={date}
                mode="date"
                onChange={(e, selected) => {
                  setShowDate(false);
                  if (selected) {
                    const d = new Date(date);
                    d.setFullYear(selected.getFullYear());
                    d.setMonth(selected.getMonth());
                    d.setDate(selected.getDate());
                    setDate(d);
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
                    const d = new Date(date);
                    d.setHours(selected.getHours());
                    d.setMinutes(selected.getMinutes());
                    setDate(d);
                  }
                }}
              />
            )}
          </View>

          <View style={{ width: 20 }} />

          {/* DURATION */}
          <View style={{ flex: 1 }}>
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

        <View style={styles.row2}>
          <TextInput
            value={pName}
            onChangeText={setPName}
            placeholder="Name"
            style={[styles.input, { flex: 1 }]}
          />

           
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
          style={[styles.input, { height: 120 }]}
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={[styles.submitBtn, saving && { opacity: 0.6 }]}
          disabled={saving}
          onPress={saveChanges}
        >
          <Text style={styles.submitText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingHorizontal: 16 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

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

  label: { marginTop: 16, marginBottom: 6, fontSize: 14, fontWeight: "600" },

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
    gap: 10,
  },

  rowButtons: {
    flexDirection: "row",
    gap: 10,
  },

  typeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },

  typeBtnActive: {
    backgroundColor: "#2563EB",
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
    borderRadius: 10,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  participantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },

  participantText: { fontSize: 14, color: "#111" },

  submitBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    marginVertical: 30,
  },

  submitText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
});
