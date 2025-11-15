import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();

  // Still restoring token → show splash
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Not logged in → go login
  if (!user) {
    return <Redirect href="/login" />;
  }

  // Logged in → route by role
  if (user.primaryRole === "admin") {
    return <Redirect href="/(admin)" />;
  }

  if (user.primaryRole === "leader") {
    return <Redirect href="/(leader)" />;
  }

  return <Redirect href="/(customer)" />;
}
