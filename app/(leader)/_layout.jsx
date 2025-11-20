import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function LeaderLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;
  if (user.primaryRole !== "leader") return <Redirect href="/login" />;

  

  const isLevel1 = user?.level === "L1" || user?.leaderLevel === 1;

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

      {/* 1. HOME */}
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

      {/* 2. ADD CUSTOMER */}
      <Tabs.Screen
        name="add-customer/index"
        options={{
          title: "Add Customer",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person-add" : "person-add-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />

       <Tabs.Screen
        name="commissions/index"
        options={{
          title: "Earnings", // "Commissions" might be too long
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "wallet" : "wallet-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* 3. ADD L2 LEADER (Conditional) */}
      <Tabs.Screen
        name="add-l2/index"
        options={{
          // ✅ Logic: If isLevel1 is true, show the link. Else, hide it (null).
          href: isLevel1 ? "/(leader)/add-l2" : null,
          title: "Add L2",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "people" : "people-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
        <Tabs.Screen
        name="calculator/index"
        options={{
          title: "Calculator",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "calculator" : "calculator-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* 4. PROFILE */}
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

      {/* 5. SETTINGS */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "settings" : "settings-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      

      {/* --- HIDDEN SCREENS (Registered to prevent auto-tabs) --- */}
      
      {/* Ensure 'create-l2' is hidden if you haven't renamed it yet */}
      <Tabs.Screen name="create-l2/index" options={{ href: null }} />

      <Tabs.Screen name="customers/index" options={{ href: null }} />
      <Tabs.Screen name="customers/[id]" options={{ href: null }} />
      <Tabs.Screen name="add-customer/step2" options={{ href: null }} />
      <Tabs.Screen name="add-customer/step3" options={{ href: null }} />
      <Tabs.Screen name="add-customer/UploadSheet" options={{ href: null }} />
      <Tabs.Screen name="customers/CreateInvestmentModal" options={{ href: null }} />

    </Tabs>
  );
}