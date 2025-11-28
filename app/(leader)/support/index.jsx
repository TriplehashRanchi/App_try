import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { io } from "socket.io-client";

dayjs.extend(relativeTime);

// Replace with your actual backend URL
const SOCKET_URL = "https://api.rmclub.co"; 

export default function SupportChatScreen() {
  const { axiosAuth, user } = useAuth();
  const router = useRouter();
  
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  // --- 1. Initialize Chat & Fetch Messages ---
  useEffect(() => {
    if (!user) return;

    const initChat = async () => {
      try {
        setLoading(true);
        // Get or Create Chat Room
        const { data } = await axiosAuth().get("/support/my-chat");
        setChat(data);

        // Fetch History
        const msgRes = await axiosAuth().get(`/support/${data.id}/messages`);
        setMessages(msgRes.data);

        // Connect Socket
        connectSocket(data.id);
      } catch (err) {
        console.error("Chat Init Error:", err);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  // --- 2. Socket Connection Logic ---
  const connectSocket = (chatId) => {
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("✅ Socket Connected:", socket.id);
      socket.emit("joinChat", chatId);
    });

    socket.on("receiveMessage", (msg) => {
      if (msg.chatId === chatId) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    });
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // --- 3. Send Message ---
  const sendMessage = async () => {
    if (!input.trim() || !chat) return;

    const tempMsg = input;
    setInput(""); // Clear UI immediately for speed
    setSending(true);

    try {
      await axiosAuth().post("/support/message", {
        chatId: chat.id,
        message: tempMsg,
      });
      // Socket will receive the message back and update UI
    } catch (err) {
      console.error("Send Error:", err);
    } finally {
      setSending(false);
    }
  };

  // --- Render Item for FlatList ---
  const renderMessage = ({ item }) => {
    const isMe = item.senderId === user.id;
    return (
      <View
        style={[
          styles.msgBubble,
          isMe ? styles.msgMe : styles.msgSupport,
        ]}
      >
        <Text style={[styles.msgText, isMe ? styles.textMe : styles.textSupport]}>
          {item.message}
        </Text>
        <Text style={[styles.msgTime, isMe ? styles.timeMe : styles.timeSupport]}>
          {dayjs(item.createdAt).fromNow()}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>RM Support</Text>
          <Text style={styles.headerStatus}>We usually reply in minutes</Text>
        </View>
      </View>

      {/* Chat Area */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={scrollToBottom}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                👋 Hi {user?.username}! How can we help you today?
              </Text>
            </View>
          }
        />
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!input.trim() || sending}
            style={[
              styles.sendBtn,
              (!input.trim() || sending) && styles.sendBtnDisabled,
            ]}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  headerStatus: { fontSize: 12, color: "#10B981", fontWeight: "500" },

  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  listContent: { padding: 16, paddingBottom: 20 },

  // --- Chat Bubbles ---
  msgBubble: {
    maxWidth: "80%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  // Customer Message (Right)
  msgMe: {
    alignSelf: "flex-end",
    backgroundColor: "#1E6DEB",
    borderBottomRightRadius: 4,
  },

  // Support Message (Left)
  msgSupport: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    borderBottomLeftRadius: 4,
  },

  msgText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
  },
  textMe: { color: "#fff" },
  textSupport: { color: "#1F2937" },

  msgTime: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.6,
    alignSelf: "flex-end",
  },
  timeMe: { color: "#fff" },
  timeSupport: { color: "#374151" },

  emptyState: { marginTop: 50, alignItems: "center" },
  emptyText: { color: "#6B7280", fontSize: 14, lineHeight: 20 },

  // --- Input Bar ---
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
    color: "#111",
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#1E6DEB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    shadowColor: "#1E6DEB",
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sendBtnDisabled: {
    backgroundColor: "#93C5FD",
    shadowOpacity: 0,
  },
});
