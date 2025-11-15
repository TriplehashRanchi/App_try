import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { user, loading } = useAuth();

if (loading) return null;
if (!user) return <Redirect href="/login" />;
if (user.primaryRole !== "admin") return <Redirect href="/login" />;


  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
    </Tabs>
  );
}
