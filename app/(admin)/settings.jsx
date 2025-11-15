import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function Settings() {
  const { logout } = useAuth();

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        paddingTop: 50,
        backgroundColor: "#F7F7F7",
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "600",
          marginBottom: 20,
        }}
      >
        Settings
      </Text>

      {/* LOGOUT BUTTON */}
      <TouchableOpacity
        onPress={logout}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 14,
          backgroundColor: "#FF3B30",
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text
          style={{
            color: "white",
            fontSize: 16,
            fontWeight: "600",
            marginLeft: 10,
          }}
        >
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}
