import { Text, View } from "react-native";

export default function HeaderGreeting({ name }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 40 }}>
      <Text style={{ fontSize: 28, fontWeight: "700", color: "#111" }}>
        {greeting}, {name.split(" ")[0]} 👋
      </Text>
      <Text style={{ color: "#666", marginTop: 4, fontSize: 15 }}>
        Here’s your financial snapshot
      </Text>
    </View>
  );
}
