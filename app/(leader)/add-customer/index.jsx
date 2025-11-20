import { AppInput } from "@/components/ui/AppInput"; // Import the safe component
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddCustomerStep1() {
  const router = useRouter();
  const { user, axiosAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    referredByLeaderId: "",
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({ ...prev, referredByLeaderId: user.id }));
    }
  }, [user]);

  const handleNext = async () => {
    // Basic Validation
    if (!form.firstName || !form.lastName || !form.phone || !form.password) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
        referredByLeaderId: form.referredByLeaderId,
      };

      // Create Draft API call (Matches your web Step 1)
      const response = await axiosAuth().post('/customers/draft', payload);
      const newCustomerId = response.data.customerId;

      // Navigate to Step 2 with the ID and form data
      router.push({
        pathname: "/(leader)/add-customer/step2",
        params: { ...form, customerId: newCustomerId },
      });

    } catch (error) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to create customer draft.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#111827" }}>Onboard Customer</Text>
        <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>Step 1 of 3: Personal Details</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Form Card */}
        <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 16, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
          <AppInput label="First Name" placeholder="John" value={form.firstName} onChangeText={(v) => setForm({ ...form, firstName: v })} />
          <AppInput label="Last Name" placeholder="Doe" value={form.lastName} onChangeText={(v) => setForm({ ...form, lastName: v })} />
          <AppInput label="Email Address" placeholder="john@example.com" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" />
          <AppInput label="Phone Number" placeholder="9876543210" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" />
          <AppInput label="Password" placeholder="Create a secure password" value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} secure />
          <AppInput label="Address" placeholder="Full residential address" value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} />
        </View>

        <TouchableOpacity
          onPress={handleNext}
          disabled={isLoading}
          style={{
            backgroundColor: "#2563eb",
            paddingVertical: 18,
            borderRadius: 14,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: "#2563eb",
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
            elevation: 4
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Save & Continue →</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}