import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    console.log("🔥 Login button pressed");

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const user = await login(username, password);
      console.log("➡️ POST LOGIN USER:", user);

      if (!user) {
        setError("Login error: User object missing");
        return;
      }

      // ROLE REDIRECT
      if (user.primaryRole === "admin") {
        router.replace("/(admin)");
      } else if (user.primaryRole === "leader") {
        router.replace("/(leader)");
      } else if(user.primaryRole === "manager") {
        router.replace("/(manager)");
      }
       else {
        router.replace("/(customer)");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Login failed. Check credentials.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>RM Club</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter username"
          placeholderTextColor="#777"
          value={username}
          onChangeText={setUsername}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor="#777"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={submitting}
          style={[styles.button, submitting && styles.buttonDisabled]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
    color: "#1E6DEB",
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F2F3F5",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1E6DEB",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#9EC4FF",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    backgroundColor: "#FFE6E6",
    color: "#D62828",
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 16,
  },
});
