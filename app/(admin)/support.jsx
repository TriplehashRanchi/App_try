"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { io } from "socket.io-client";

const SOCKET_URL = 'https://api.rmclub.co';

export default function SupportAdminPage() {
  const { axiosAuth, user, isLoggedIn, loading } = useAuth();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  // Format time (HH:MM)
  const formatTime = (date) => {
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Format date for chat list
  const formatChatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const chatDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    
    const diffTime = today - chatDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return formatTime(date);
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[d.getDay()];
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    }
  };

  // ✅ 1. Initialize socket
  useEffect(() => {
    if (!isLoggedIn || loading) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;
    console.log('🟢 Socket initialized');

    socket.on('connect', () => {
      console.log('✅ Connected to socket:', socket.id);
      if (activeChat?.id) socket.emit('joinChat', activeChat.id);
    });

    socket.on('disconnect', () => console.log('🔴 Socket disconnected'));

    return () => {
      socket.disconnect();
    };
  }, [isLoggedIn, loading]);

  // ✅ 2. Listen for messages
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleIncoming = (msg) => {
      setMessages((prev) => {
        const exists = prev.some(
          (m) => m.chatId === msg.chatId && 
                 m.message === msg.message && 
                 m.senderId === msg.senderId && 
                 Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 1000
        );
        if (exists) return prev;
        return [...prev, msg];
      });

      // Update chat list with new message
      setChats((prev) => prev.map(chat => 
        chat.id === msg.chatId 
          ? { ...chat, lastMessage: msg.message, lastMessageAt: msg.createdAt }
          : chat
      ));

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    socket.on('receiveMessage', handleIncoming);

    return () => {
      socket.off('receiveMessage', handleIncoming);
    };
  }, [activeChat]);

  // ✅ 3. Fetch chat list
  useEffect(() => {
    if (!isLoggedIn || loading) return;

    const fetchChats = async () => {
      try {
        const res = await axiosAuth().get('/support');
        setChats(res.data);
      } catch (err) {
        console.error('❌ Error fetching chats:', err);
      } finally {
        setLoadingChats(false);
      }
    };

    fetchChats();
  }, [isLoggedIn, loading]);

  // ✅ 4. Open chat
  const openChat = async (chat) => {
    setActiveChat(chat);
    setMessages([]);
    
    try {
      const res = await axiosAuth().get(`/support/${chat.id}/messages`);
      setMessages(res.data);
      socketRef.current?.emit('joinChat', chat.id);
      console.log('📩 Joined chat room:', chat.id);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (err) {
      console.error('❌ Failed to open chat:', err);
    }
  };

  // ✅ 5. Send message
  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return;
    
    const messageToSend = input.trim();
    setSending(true);
    setInput("");

    try {
      await axiosAuth().post('/support/message', {
        chatId: activeChat.id,
        message: messageToSend,
      });
    } catch (err) {
      console.error('❌ Send message failed:', err);
      setInput(messageToSend);
    } finally {
      setSending(false);
    }
  };

  // Show user info modal
  const showUserInfo = async (userId) => {
    try {
      const res = await axiosAuth().get(`/customers/${userId}`);
      setSelectedUser(res.data);
      setInfoModalVisible(true);
    } catch (err) {
      console.error('❌ Failed to fetch user info:', err);
    }
  };

  // Go back to chat list
  const goBackToList = () => {
    setActiveChat(null);
    setMessages([]);
  };

  // Render chat item
  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => openChat(item)}
    >
      <View style={styles.chatAvatar}>
        <Text style={styles.chatAvatarText}>
          {item.email?.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatEmail} numberOfLines={1}>
            {item.email}
          </Text>
          <Text style={styles.chatTime}>
            {formatChatDate(item.lastMessageAt)}
          </Text>
        </View>
        
        <Text style={styles.chatLastMessage} numberOfLines={1}>
          {item.lastMessage || 'No messages yet'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render message item
  const renderMessage = ({ item }) => {
    const isSupport = item.isSupport;
    
    return (
      <View
        style={[
          styles.messageRow,
          isSupport ? styles.messageRowSelf : styles.messageRowOther,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isSupport ? styles.bubbleSelf : styles.bubbleOther,
          ]}
        >
          <Text style={[styles.msgText, isSupport && styles.msgTextSelf]}>
            {item.message}
          </Text>
          <Text style={[styles.timeText, isSupport && styles.timeTextSelf]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (loadingChats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#387AFF" />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // CHAT LIST VIEW
  if (!activeChat) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Support Chats</Text>
          <View style={styles.chatCount}>
            <Text style={styles.chatCountText}>{chats.length}</Text>
          </View>
        </View>

        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.chatList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>💬</Text>
              <Text style={styles.emptyStateTitle}>No Chats Yet</Text>
              <Text style={styles.emptyStateText}>
                Customer support chats will appear here
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  // CHAT CONVERSATION VIEW
  return (
     <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
  >
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.chatConversationHeader}>
        <TouchableOpacity 
          onPress={goBackToList}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.headerUserInfo}
          onPress={() => showUserInfo(activeChat.userId || activeChat.senderId)}
        >
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {activeChat.email?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerEmail} numberOfLines={1}>
              {activeChat.email}
            </Text>
            <Text style={styles.headerRole}>{activeChat.role}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRight} />
      </View>

      {/* MESSAGES */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <Text style={styles.emptyMessagesText}>No messages yet</Text>
          </View>
        }
      />

      {/* INPUT */}
     
        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your reply..."
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
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendBtnIcon}>→</Text>
            )}
          </TouchableOpacity>
        </View>
      

      {/* USER INFO MODAL */}
      <Modal
        visible={infoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Customer Information</Text>
              <TouchableOpacity 
                onPress={() => setInfoModalVisible(false)}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.userInfoRow}>
                  <Text style={styles.userInfoLabel}>Name</Text>
                  <Text style={styles.userInfoValue}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Text>
                </View>

                <View style={styles.userInfoRow}>
                  <Text style={styles.userInfoLabel}>Email</Text>
                  <Text style={styles.userInfoValue}>{selectedUser.email}</Text>
                </View>

                <View style={styles.userInfoRow}>
                  <Text style={styles.userInfoLabel}>Phone</Text>
                  <Text style={styles.userInfoValue}>{selectedUser.phone}</Text>
                </View>

                <View style={styles.userInfoRow}>
                  <Text style={styles.userInfoLabel}>Status</Text>
                  <Text style={[styles.userInfoValue, styles.userStatusActive]}>
                    {selectedUser.status}
                  </Text>
                </View>

                <View style={styles.userInfoRow}>
                  <Text style={styles.userInfoLabel}>Address</Text>
                  <Text style={styles.userInfoValue}>{selectedUser.address}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    marginBottom: -10,
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

  // HEADER STYLES
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  chatCount: {
    backgroundColor: "#387AFF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: "center",
  },

  chatCountText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  // CHAT LIST STYLES
  chatList: {
    flexGrow: 1,
  },

  chatItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#387AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  chatAvatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },

  chatInfo: {
    flex: 1,
    justifyContent: "center",
  },

  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  chatEmail: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },

  chatTime: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },

  chatLastMessage: {
    fontSize: 14,
    color: "#666",
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },

  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },

  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },

  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },

  // CONVERSATION VIEW STYLES
  chatConversationHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },

  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  backIcon: {
    fontSize: 28,
    color: "#222",
  },

  headerUserInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#387AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerAvatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  headerInfo: {
    flex: 1,
  },

  headerEmail: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  headerRole: {
    fontSize: 12,
    color: "#666",
    textTransform: "capitalize",
    marginTop: 2,
  },

  headerRight: {
    width: 44,
  },

  messagesList: {
    padding: 16,
    flexGrow: 1,
  },

  emptyMessages: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyMessagesText: {
    fontSize: 14,
    color: "#999",
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

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },

  modalClose: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },

  modalCloseText: {
    fontSize: 32,
    color: "#999",
    lineHeight: 32,
  },

  modalBody: {
    padding: 20,
  },

  userInfoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  userInfoLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },

  userInfoValue: {
    fontSize: 15,
    color: "#222",
    fontWeight: "500",
  },

  userStatusActive: {
    color: "#00C087",
    textTransform: "capitalize",
  },
});