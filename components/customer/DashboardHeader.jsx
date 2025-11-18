// components/customer/DashboardHeader.jsx
import { StyleSheet, Text, View } from "react-native";

export default function DashboardHeader({ user }) {
  const name = user?.username || "User";
  console.log(user)

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Hi {name}</Text>
      <Text style={styles.subheading}>Welcome to RM Club</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 20,
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
});
