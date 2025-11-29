import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Enter username & password");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const user = await login(username, password);
      if (user.primaryRole === "admin") router.replace("/(admin)");
      else if (user.primaryRole === "leader") router.replace("/(leader)");
      else if (user.primaryRole === "manager") router.replace("/(manager)");
      else router.replace("/(customer)");
    } catch (err) {
      setError(err?.response?.data?.message || "Login Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.select({ ios: 70, android: 0 })}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: Math.max(32, insets.bottom + 16) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.wrapper}>
            <Text style={styles.title}>RM Club</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* USERNAME */}
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={20} color="#6C727F" />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#9E9E9E"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            {/* PASSWORD */}
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={20} color="#6C727F" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9E9E9E"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#6C727F"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={submitting}
              style={[styles.button, submitting && { opacity: 0.8 }]}
              activeOpacity={0.9}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/forgot-password")}>
              <Text style={styles.forgot}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { flexGrow: 1, justifyContent: "start", paddingVertical: 180 },
  wrapper: {
    paddingHorizontal: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "600",
    color: "#202124",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#5F6368",
    marginBottom: 36,
  },

  error: {
    width: "100%",
    backgroundColor: "#FDECEA",
    borderColor: "#F5C6C4",
    borderWidth: 1,
    color: "#B3261E",
    fontSize: 14,
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderColor: "#DADCE0",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 22,
    paddingHorizontal: 14,
    height: 52,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#202124",
  },

  button: {
    backgroundColor: "#1A73E8",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  forgot: {
    marginTop: 18,
    fontSize: 14,
    color: "#1A73E8",
  },
});
