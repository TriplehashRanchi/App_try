"use client";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Toast from "react-native-toast-message";

export default function MeetingDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { axiosAuth } = useAuth();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add Note Modal
  const [noteModal, setNoteModal] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    loadMeeting();
  }, []);

  const loadMeeting = async () => {
    try {
      const { data } = await axiosAuth().get(`/meetings/${id}`);

      const parsed = {
        ...data,
        participants:
          typeof data.participants === "string"
            ? JSON.parse(data.participants)
            : data.participants,
      };

      setMeeting(parsed);
      setNoteInput(parsed.note || "");
    } catch (e) {
      console.log("Meeting fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      await axiosAuth().put(`/meetings/${id}/status`, { status });
      setMeeting((prev) => ({ ...prev, status }));

      Toast.show({
        type: "success",
        text1: `Meeting marked as ${status}`,
      });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Failed to update status",
      });
    }
  };

  const saveNote = async () => {
    try {
      setSavingNote(true);
      await axiosAuth().put(`/meetings/${id}/note`, { note: noteInput });

      setMeeting((prev) => ({ ...prev, note: noteInput }));
      setNoteModal(false);

      Toast.show({
        type: "success",
        text1: "Note saved successfully",
      });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Failed to save note",
      });
    } finally {
      setSavingNote(false);
    }
  };

  const deleteMeeting = () => {
    Alert.alert("Delete Meeting?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axiosAuth().delete(`/meetings/${id}`);
            router.replace("/meeting");
          } catch (e) {
            Alert.alert("Error", "Failed to delete meeting");
          }
        },
      },
    ]);
  };

  const cleanDescription = (text) => {
    if (!text) return "";
    return text.replace(/📝 \[Note.*?\]:\s*/g, "").trim();
  };

  const splitDescriptionAndNotes = (text) => {
    if (!text) return { desc: "", notes: [] };

    const lines = text.split("\n").filter(Boolean);

    // First line = actual description
    const desc = lines[0];

    // Remaining lines that contain notes
    const notes = lines
      .slice(1)
      .filter((l) => l.includes("📝"))
      .map((n) => n.replace(/📝 \[Note.*?\]:\s*/g, "").trim());

    return { desc, notes };
  };
  const { desc, notes } = meeting
    ? splitDescriptionAndNotes(meeting.description)
    : { desc: "", notes: [] };

  const getStatusPillStyles = (status) => {
    switch (status) {
      case "scheduled":
        return { bg: "#E0ECFF", text: "#2563EB" }; // Blue
      case "completed":
        return { bg: "#E6F9F0", text: "#059669" }; // Green
      case "cancelled":
        return { bg: "#FDE8E8", text: "#DC2626" }; // Red
      case "rescheduled":
        return { bg: "#FFF6E5", text: "#D97706" }; // Yellow/Orange
      default:
        return { bg: "#E5E7EB", text: "#374151" }; // Gray
    }
  };

  if (loading || !meeting) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }
  const pill = getStatusPillStyles(meeting.status);
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

          <Text style={styles.headerTitle}>Meeting Details</Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.push(`/meeting/edit/${id}`)}
            >
              <Ionicons name="create-outline" size={24} color="#2563EB" />
            </TouchableOpacity>

            <TouchableOpacity onPress={deleteMeeting}>
              <Ionicons name="trash-outline" size={24} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>

        {/* MAIN CARD (Google Calendar Style) */}
        <View style={styles.mainCard}>
          <Text style={styles.bigTitle}>{meeting.title}</Text>

          {/* DATE */}
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <Text style={styles.rowText}>
              {dayjs(meeting.meeting_date).format("dddd, DD MMM YYYY, hh:mm A")}
            </Text>
          </View>

          {/* LOCATION */}
          <View style={styles.row}>
            <Ionicons name="location-outline" size={20} color="#6B7280" />
            <Text style={styles.rowText}>
              {meeting.location_details} ({meeting.location_type})
            </Text>
          </View>

          {/* DURATION */}
          <View style={styles.row}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={styles.rowText}>
              {meeting.duration_minutes} minutes
            </Text>
          </View>

          {/* STATUS */}
          <View style={styles.row}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={pill.text}
            />
            <View style={[styles.pill, { backgroundColor: pill.bg }]}>
              <Text style={[styles.pillText, { color: pill.text }]}>
                {meeting.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* DESCRIPTION */}
          {/* DESCRIPTION */}
          {desc ? (
            <View style={styles.descBox}>
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color="#6B7280"
                />
                <Text style={[styles.descText, { marginLeft: 8 }]}>{desc}</Text>
              </View>
            </View>
          ) : null}

          {/* NOTES LIST */}
          {notes.length > 0 && (
            <View style={{ marginTop: 18 }}>
              <Text style={styles.descTitle}>Notes</Text>

              {notes.map((n, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={18}
                    color="#2563EB"
                  />
                  <Text style={[styles.descText, { marginLeft: 8 }]}>{n}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* PARTICIPANTS CARD */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Participants</Text>

          {meeting.participants?.map((p, i) => (
            <View
              key={i}
              style={[
                styles.partRow,
                i !== meeting.participants.length - 1 && styles.divider,
              ]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {p.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.partName}>{p.name}</Text>
                <Text style={styles.partMeta}>{p.email || p.phone}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* NOTES CARD */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notes</Text>

          <Text style={styles.descText}>
            {meeting.note || "No notes added"}
          </Text>

          <TouchableOpacity
            style={styles.noteBtn}
            onPress={() => setNoteModal(true)}
          >
            <Ionicons name="create-outline" size={18} color="#2563EB" />
            <Text style={styles.noteBtnText}>
              {meeting.note ? "Edit Note" : "Add Note"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ACTION BAR */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.successBtn]}
            onPress={() => updateStatus("completed")}
          >
            <Text style={styles.actionText}>Complete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={() => updateStatus("cancelled")}
          >
            <Text style={styles.actionText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.primaryBtn]}
            onPress={() => updateStatus("rescheduled")}
          >
            <Text style={styles.actionText}>Reschedule</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* NOTE MODAL */}
      <Modal visible={noteModal} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Note</Text>

            <TextInput
              style={styles.modalInput}
              multiline
              value={noteInput}
              onChangeText={setNoteInput}
              placeholder="Write your note..."
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setNoteModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSave}
                onPress={saveNote}
                disabled={savingNote}
              >
                <Text style={styles.modalSaveText}>
                  {savingNote ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ------------------- STYLES ------------------- */

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  container: { flex: 1, backgroundColor: "#F3F4F6", paddingHorizontal: 16 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16,
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

  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  /* MAIN GOOGLE CALENDAR CARD */
  mainCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,

    marginBottom: 16,
    borderRadius: 10,
  },

  bigTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },

  rowText: {
    fontSize: 15,
    color: "#111",
  },

  descTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 6,
  },

  descText: {
    fontSize: 14,
    color: "#111",
    lineHeight: 20,
  },

  /* OTHER CARDS */
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },

  partRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4338CA",
  },

  partName: { fontSize: 14, fontWeight: "700", color: "#111" },
  partMeta: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  noteBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  noteBtnText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },

  /* ACTION BAR */
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
    marginBottom: 30,
  },

  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  actionText: { fontSize: 14, fontWeight: "700", color: "#fff" },

  primaryBtn: { backgroundColor: "#387AFF" },
  successBtn: { backgroundColor: "#059669" },
  cancelBtn: { backgroundColor: "#e43d3dff" },

  /* MODAL */
  modalWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  modalInput: {
    height: 120,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top",
    fontSize: 14,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 14,
    gap: 10,
  },
  modalCancel: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  modalCancelText: { color: "#6B7280", fontSize: 14 },
  modalSave: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },

  modalSaveText: { color: "#fff", fontWeight: "700" },

  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  pillText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
