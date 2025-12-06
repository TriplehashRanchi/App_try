"use client";

import { useAuth } from "@/context/AuthContext";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { io } from "socket.io-client";

export default function SupportChatBox() {
  const { axiosAuth, user, isLoggedIn } = useAuth();
  const router = useRouter();

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  // Format time for display (HH:MM)
  const formatTime = (date) => {
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Format date for day separators
  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // -----------------------------
  // SOCKET INIT
  // -----------------------------
  useEffect(() => {
    if (!isLoggedIn) return;

    const socket = io('https://api.rmclub.co', {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Socket Connected:", socket.id);
      setConnected(true);
      if (chat?.id) {
        socket.emit("joinChat", chat.id);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket Disconnected");
      setConnected(false);
    });

    socket.on("receiveMessage", (msg) => {
      console.log("📩 New message received:", msg);
      if (msg.chatId === chat?.id) {
        setMessages((prev) => {
          const exists = prev.some(m => m.id === msg.id);
          if (exists) return prev;
          return [...prev, msg];
        });
        
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isLoggedIn, chat?.id]);

  useEffect(() => {
    if (chat?.id && socketRef.current?.connected) {
      socketRef.current.emit("joinChat", chat.id);
    }
  }, [chat?.id]);

  // -----------------------------
  // FETCH CHAT & MESSAGES
  // -----------------------------
  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const { data } = await axiosAuth().get("/support/my-chat");
        setChat(data);

        const msgRes = await axiosAuth().get(`/support/${data.id}/messages`);
        setMessages(msgRes.data);

        if (socketRef.current?.connected) {
          socketRef.current.emit("joinChat", data.id);
        }
      } catch (err) {
        console.log("Chat load error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [isLoggedIn]);

  // -----------------------------
  // SEND MESSAGE
  // -----------------------------
  const sendMessage = async () => {
    if (!input.trim() || !chat) return;
    
    const tempMessage = input.trim();
    setSending(true);
    setInput("");

    try {
      const { data } = await axiosAuth().post("/support/message", {
        chatId: chat.id,
        message: tempMessage,
      });

      setMessages((prev) => {
        const exists = prev.some(m => m.id === data.id);
        if (exists) return prev;
        return [...prev, data];
      });

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (err) {
      console.log("Send error:", err.response?.data || err.message);
      setInput(tempMessage);
    } finally {
      setSending(false);
    }
  };

  // Render message item
  const renderMessage = ({ item, index }) => {
    const isSelf = item.senderId === user?.id;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showDateSeparator = !prevMessage || 
      formatDate(item.createdAt) !== formatDate(prevMessage.createdAt);
    
    return (
      <>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.messageRow,
            isSelf ? styles.messageRowSelf : styles.messageRowOther,
          ]}
        >
          <View
            style={[
              styles.bubble,
              isSelf ? styles.bubbleSelf : styles.bubbleOther,
            ]}
          >
            <Text style={[styles.msgText, isSelf && styles.msgTextSelf]}>
              {item.message}
            </Text>
            <Text style={[styles.timeText, isSelf && styles.timeTextSelf]}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#387AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Login Required</Text>
          <Text style={styles.emptyText}>Please login to access support chat</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
  >
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Support</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, connected && styles.statusDotOnline]} />
            <Text style={styles.headerSubtitle}>
              {connected ? "Online" : "Connecting..."}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerRight} />
      </View>

      {/* MESSAGES LIST */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <Text style={styles.emptyMessagesIcon}>💬</Text>
            <Text style={styles.emptyMessagesTitle}>No messages yet</Text>
            <Text style={styles.emptyMessagesText}>
              Start a conversation with our support team
            </Text>
          </View>
        }
      />

     
     
        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            style={styles.input}
            onSubmitEditing={sendMessage}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            onPress={sendMessage}
            disabled={sending || !input.trim()}
            style={[
              styles.sendBtn,
              (!input.trim() || sending) && styles.sendBtnDisabled
            ]}
          >
            <Text style={styles.sendBtnIcon}>
              {sending ? "..." : "→"}
            </Text>
          </TouchableOpacity>
        </View>
     
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#fff",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  backIcon: {
    fontSize: 24,
    color: "#222",
  },

  headerCenter: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
    marginRight: 6,
  },

  statusDotOnline: {
    backgroundColor: "#00C087",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#666",
  },

  headerRight: {
    width: 40,
  },

  messagesList: {
    padding: 16,
    paddingBottom: 5,
    flexGrow: 1,
  },

  dateSeparator: {
    alignItems: "center",
    marginVertical: 16,
  },

  dateSeparatorText: {
    fontSize: 12,
    color: "#999",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  emptyMessages: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyMessagesIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyMessagesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },

  emptyMessagesText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },

  messageRow: {
    marginBottom: 8,
    maxWidth: "75%",
  },

  messageRowSelf: {
    alignSelf: "flex-end",
  },

  messageRowOther: {
    alignSelf: "flex-start",
  },

  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },

  bubbleSelf: {
    backgroundColor: "#387AFF",
  },

  bubbleOther: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },

  msgText: {
    fontSize: 15,
    color: "#222",
    lineHeight: 20,
    marginBottom: 4,
  },

  msgTextSelf: {
    color: "#fff",
  },

  timeText: {
    fontSize: 11,
    color: "#999",
    textAlign: "right",
  },

  timeTextSelf: {
    color: "rgba(255,255,255,0.7)",
  },

  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    alignItems: "flex-end",
  },

  input: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    fontSize: 15,
    maxHeight: 100,
    color: "#222",
  },

  sendBtn: {
    marginLeft: 12,
    width: 44,
    height: 44,
    backgroundColor: "#387AFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },

  sendBtnDisabled: {
    backgroundColor: "#E8E8E8",
  },

  sendBtnIcon: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
});