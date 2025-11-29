import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const { bottom } = useSafeAreaInsets();
  const tabBarPaddingBottom = Math.max(12, bottom + 8);

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;
  if (user.primaryRole !== "admin") return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#00C285",
        tabBarInactiveTintColor: "#7A7A7A",
        headerShown: false,

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },

        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: "#f0f0f0",
          paddingTop: 8,
          paddingBottom: tabBarPaddingBottom,
          height: 64 + bottom,
        },
      }}
    >

      {/* 1 — Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={focused ? "#00C285" : "#7A7A7A"}
            />
          ),
        }}
      />

      {/* 2 — Customers */}
      <Tabs.Screen
        name="customers"
        options={{
          title: "Customers",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={size}
              color={focused ? "#00C285" : "#7A7A7A"}
            />
          ),
        }}
      />

      {/* 3 — Leaders */}
      <Tabs.Screen
        name="leaders"
        options={{
          title: "Leaders",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name={focused ? "ribbon" : "ribbon-outline"}
              size={size}
              color={focused ? "#00C285" : "#7A7A7A"}
            />
          ),
        }}
      />

      {/* 4 — Investments */}
      <Tabs.Screen
        name="insvestment"
        options={{
          title: "Investments",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name={focused ? "cash" : "cash-outline"}
              size={size}
              color={focused ? "#00C285" : "#7A7A7A"}
            />
          ),
        }}
      />

      {/* 5 — Support */}
      <Tabs.Screen
        name="support"
        options={{
          title: "Support",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              size={size}
              color={focused ? "#00C285" : "#7A7A7A"}
            />
          ),
        }}
      />

      {/* ❌ Hidden pages — not visible tab items */}
      <Tabs.Screen name="meeting" options={{ href: null }} />
      <Tabs.Screen name="targets" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />

    </Tabs>
  );
}
