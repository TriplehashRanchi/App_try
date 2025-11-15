import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function CustomerLayout() {
  const { user, loading } = useAuth();

if (loading) return null;
if (!user) return <Redirect href="/login" />;
if (user.primaryRole !== "leader") return <Redirect href="/login" />;


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1E6DEB",
        tabBarInactiveTintColor: "#7A7A7A",
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: "#ddd",
          paddingBottom: 4,
          height: 58,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
