// import Feather from '@expo/vector-icons/Feather';
// import Ionicons from "@expo/vector-icons/Ionicons";
// import { Redirect, Tabs } from "expo-router";
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { useAuth } from "../../context/AuthContext";

// export default function CustomerLayout() {
//   const { user, loading } = useAuth();

// if (loading) return null;
// if (!user) return <Redirect href="/login" />;
// if (user.primaryRole !== "customer") return <Redirect href="/login" />;


//   return (
//      <GestureHandlerRootView style={{ flex: 1 }}>
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: "#1E6DEB",
//         tabBarInactiveTintColor: "#7A7A7A",
//         headerShown: false,
//         tabBarStyle: {
//           borderTopWidth: 0.5,
//           borderTopColor: "#ddd",
//           paddingBottom: 4,
//           height: 58,
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Home",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="home-outline" size={size} color={color} />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: "Profile",
//           tabBarIcon: ({ color, size }) => (
//             <Feather name="user" size={24} color="#808080ff" />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="settings"
//         options={{
//           title: "Settings",
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="settings-outline" size={size} color={color} />
//           ),
//         }}
//       />
//     </Tabs>
//     </GestureHandlerRootView>
//   );
// }

import Feather from '@expo/vector-icons/Feather';
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Redirect, Tabs } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from "../../context/AuthContext";

export default function CustomerLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;
  if (user.primaryRole !== "customer") return <Redirect href="/login" />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#387AFF",
          tabBarInactiveTintColor: "#999",
          headerShown: false,
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: "#E8E8E8",
            paddingBottom: 8,
            paddingTop: 8,
            height: 64,
            backgroundColor: "#fff",
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "500",
          },
        }}
      >
        {/* HOME TAB */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={24} color={color} />
            ),
          }}
        />

        {/* PROFILE TAB */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Feather name="user" size={24} color={color} />
            ),
          }}
        />

        {/* CALCULATOR TAB */}
        <Tabs.Screen
          name="calculator"
          options={{
            title: "Calculator",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="calculator" size={24} color={color} />
            ),
          }}
        />

        {/* CHAT TAB */}
        <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubble-outline" size={24} color={color} />
            ),
          }}
        />

        {/* HIDDEN ROUTES */}
        <Tabs.Screen
          name="investments"
          options={{
            href: null, // This hides it from tabs
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            href: null, // This hides it from tabs
          }}
        />

        <Tabs.Screen
          name="edit"
          options={{
            href: null, // This hides it from tabs
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
