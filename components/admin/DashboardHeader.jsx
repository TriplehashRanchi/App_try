// components/customer/DashboardHeader.jsx
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function DashboardHeader({ user, onLogout }) {
  const name = user?.username || "User";
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      {/* LEFT SIDE */}
      <View>
        <Text style={styles.heading}>Hello, {name}</Text>
        <Text style={styles.subheading}>Welcome to RM Club</Text>
      </View>

      {/* RIGHT SIDE LOGOUT BUTTON */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <AntDesign name="logout" size={24} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  subheading: {
    fontSize: 15,
    fontWeight: "400",
    color: "#777",
    marginTop: 3,
  },

  logoutBtn: {
    padding: 8,
   },
});
