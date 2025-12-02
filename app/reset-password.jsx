// app/reset-password.jsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { axiosAuth } = useAuth();

  const emailFromParams = typeof params.email === "string" ? params.email : "";
  const [email, setEmail] = useState(emailFromParams);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (emailFromParams) setEmail(emailFromParams);
  }, [emailFromParams]);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Enter email and new password");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await axiosAuth().post("/auth/reset-password", {
        email,
        newPassword: password,
      });

      Alert.alert("Success", "Password updated successfully", [
        {
          text: "OK",
          onPress: () => router.replace("/login"),
        },
      ]);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to reset password.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const emailEditable = !emailFromParams;

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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Set a new password for your account.
            </Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TextInput
              style={[
                styles.input,
                !emailEditable && { backgroundColor: "#F1F3F4" },
              ]}
              placeholder="Email"
              placeholderTextColor="#9E9E9E"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={emailEditable}
            />

            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor="#9E9E9E"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              style={[styles.button, submitting && { opacity: 0.8 }]}
              activeOpacity={0.9}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text style={styles.backToLogin}>Back to login</Text>
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
  scroll: { flexGrow: 1, justifyContent: "center", paddingVertical: 80 },
  wrapper: {
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#202124",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#5F6368",
    marginBottom: 24,
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
  input: {
    width: "100%",
    borderColor: "#DADCE0",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 16,
    color: "#202124",
    marginBottom: 22,
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
  backToLogin: {
    marginTop: 18,
    fontSize: 14,
    color: "#1A73E8",
    textAlign: "center",
  },
});
