import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;
  if (user.primaryRole !== "admin") return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1E6DEB",
        tabBarInactiveTintColor: "#7A7A7A",
        headerShown: false,

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          color: "#7A7A7A",
        },

        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: "#f9f7f7ff",
          height: 72,
          paddingTop: 10,
          paddingBottom: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={focused ? "#00C285" : "#7A7A7A"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="customers"
        options={{
          title: "Customers",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={size}
              color={focused ? "#00C285" : "#7A7A7A"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="leaders"
        options={{
          title: "Leaders",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "ribbon" : "ribbon-outline"}
              size={size}
              color={focused ? "#00C285" : "#7A7A7A"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="insvestment"
        options={{
          title: "Investments",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cash" : "cash-outline"}
              size={size}
              color={focused ? "#00C285" : "#7A7A7A"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="meeting"
        options={{
          title: "Meetings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={size}
              color={focused ? "#00C285" : "#7A7A7A"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
