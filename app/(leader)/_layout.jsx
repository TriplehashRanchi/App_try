import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function LeaderLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;
  if (user.primaryRole !== "leader") return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#10B981", // ✅ ACTIVE TAB = GREEN
        tabBarInactiveTintColor: "#7A7A7A",
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: "#ddd",
          paddingBottom: 4,
          height: 60,
          backgroundColor: "#fff",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginBottom: 4,
        },
      }}
    >

      {/* 1️⃣ HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 2️⃣ CALCULATOR */}
      <Tabs.Screen
        name="calculator/index"
        options={{
          title: "Calculator",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "calculator" : "calculator-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 3️⃣ PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 4️⃣ SUPPORT */}
      <Tabs.Screen
        name="support/index"
        options={{
          title: "Support",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubble" : "chatbubble-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />


      {/* -------- HIDDEN ROUTES (Very Important) -------- */}
      <Tabs.Screen name="add-customer/index" options={{ href: null }} />
      <Tabs.Screen name="add-l2/index" options={{ href: null }} />
      <Tabs.Screen name="commissions/index" options={{ href: null }} />
      <Tabs.Screen name="customers/index" options={{ href: null }} />
      <Tabs.Screen name="customers/[id]" options={{ href: null }} />
      <Tabs.Screen name="investments/index" options={{ href: null }} />
      <Tabs.Screen name="investments/[id]/index" options={{ href: null }} />
      <Tabs.Screen name="support/profile" options={{ href: null }} />
      <Tabs.Screen name="add-customer/step2" options={{ href: null }} />
      <Tabs.Screen name="add-customer/step3" options={{ href: null }} />
      <Tabs.Screen name="add-customer/UploadSheet" options={{ href: null }} />
      <Tabs.Screen name="customers/CreateInvestmentModal" options={{ href: null }} />

    </Tabs>
  );
}
