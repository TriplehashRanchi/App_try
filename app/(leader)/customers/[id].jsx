import { useAuth } from "@/context/AuthContext";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomerDetailPage() {
  const { id } = useLocalSearchParams();
  const { axiosAuth } = useAuth();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  const staticUrl = "https://api.rmclub.co";

  const syncEditForm = useCallback((data) => {
    setEditForm({
      firstName: data?.firstName || "",
      lastName: data?.lastName || "",
      email: data?.email || "",
      phone: data?.phone || "",
      address: data?.address || "",
    });
  }, []);

  const fetchCustomer = useCallback(async () => {
    if (!axiosAuth || !id) return;
    try {
      setLoading(true);
      const res = await axiosAuth().get(`/customers/${id}`);
      setCustomer(res.data);
      syncEditForm(res.data);
    } catch (err) {
      console.log("Customer fetch error", err);
      router.push("/customers");
    } finally {
      setLoading(false);
    }
  }, [axiosAuth, id, syncEditForm]);

  useFocusEffect(
    useCallback(() => {
      fetchCustomer();
    }, [fetchCustomer])
  );

  const updateField = (key, value) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancelEdit = () => {
    syncEditForm(customer);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      Alert.alert("Required", "First name and last name are required.");
      return;
    }

    try {
      setSaving(true);
      const adminPayload = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        phone2: customer.phone2 || "",
        aadharNumber: customer.aadharNumber || "",
        panNumber: customer.panNumber || "",
        referredByLeaderId: customer.referredByLeaderId || null,
        bankName: customer.bankAccounts?.[0]?.bankName || "",
        accountNumber: customer.bankAccounts?.[0]?.accountNumber || "",
        ifscCode: customer.bankAccounts?.[0]?.ifscCode || "",
      };

      try {
        await axiosAuth().put(`/customers/${id}/admin-update`, adminPayload);
      } catch (err) {
        const isDraftCustomer = customer.status === "pending_onboarding";
        const isPermissionError = err?.response?.status === 403;

        if (!isPermissionError || !isDraftCustomer) {
          throw err;
        }

        await axiosAuth().put(`/customers/draft/${id}`, {
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          phone: editForm.phone.trim(),
          address: editForm.address.trim(),
          referredByLeaderId: customer.referredByLeaderId || null,
        });
      }

      await fetchCustomer();
      setIsEditing(false);
      Alert.alert("Success", "Customer profile updated.");
    } catch (err) {
      console.log("Customer update error", {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });
      Alert.alert(
        "Update failed",
        err?.response?.data?.message || "Could not update customer profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Customer not found.</Text>
      </View>
    );
  }

  const doc = (type) => customer?.documents?.find((d) => d.type === type);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: isEditing ? 180 : 120,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => router.push("/customers")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Feather name="arrow-left" size={20} color="#374151" />
            <Text style={{ marginLeft: 6, fontWeight: "600", color: "#374151" }}>
              Back
            </Text>
          </TouchableOpacity>

          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: "#1f2937",
                borderRadius: 40,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 32, color: "#fff", fontWeight: "bold" }}>
                {customer.firstName?.charAt(0)}
                {customer.lastName?.charAt(0)}
              </Text>
            </View>

            <Text style={{ marginTop: 10, fontSize: 22, fontWeight: "700" }}>
              {customer.firstName} {customer.lastName}
            </Text>
            <Text style={{ color: "#6b7280" }}>{customer.email}</Text>

            <View
              style={{
                marginTop: 10,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 18,
                backgroundColor:
                  customer.status === "active" ? "#dcfce7" : "#fef3c7",
              }}
            >
              <Text
                style={{
                  color: customer.status === "active" ? "#166534" : "#a16207",
                  fontWeight: "600",
                }}
              >
                {customer.status.replace("_", " ")}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                if (isEditing) {
                  handleCancelEdit();
                } else {
                  syncEditForm(customer);
                  setIsEditing(true);
                }
              }}
              style={{
                marginTop: 12,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#eff6ff",
                borderWidth: 1,
                borderColor: "#bfdbfe",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 12,
              }}
            >
              <Feather
                name={isEditing ? "x" : "edit-2"}
                size={16}
                color="#1d4ed8"
              />
              <Text
                style={{
                  marginLeft: 8,
                  color: "#1d4ed8",
                  fontWeight: "700",
                }}
              >
                {isEditing ? "Close Edit" : "Edit Profile"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 12 }}>
            Profile Details
          </Text>

          {isEditing ? (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 16,
                marginBottom: 25,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "700", marginBottom: 14 }}
              >
                Edit Customer Profile
              </Text>

              {[
                {
                  key: "firstName",
                  label: "First Name",
                  keyboardType: "default",
                },
                {
                  key: "lastName",
                  label: "Last Name",
                  keyboardType: "default",
                },
                {
                  key: "email",
                  label: "Email",
                  keyboardType: "email-address",
                  autoCapitalize: "none",
                },
                {
                  key: "phone",
                  label: "Phone",
                  keyboardType: "phone-pad",
                },
                {
                  key: "address",
                  label: "Address",
                  keyboardType: "default",
                  multiline: true,
                },
              ].map((field) => (
                <View key={field.key} style={{ marginBottom: 14 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      fontWeight: "700",
                      marginBottom: 6,
                    }}
                  >
                    {field.label}
                  </Text>
                  <TextInput
                    value={editForm[field.key]}
                    onChangeText={(value) => updateField(field.key, value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    keyboardType={field.keyboardType}
                    autoCapitalize={field.autoCapitalize || "words"}
                    multiline={field.multiline}
                    textAlignVertical={field.multiline ? "top" : "center"}
                    placeholderTextColor="#9ca3af"
                    style={{
                      backgroundColor: "#f9fafb",
                      borderWidth: 1,
                      borderColor: "#e5e7eb",
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      paddingVertical: field.multiline ? 14 : 12,
                      fontSize: 15,
                      color: "#111827",
                      minHeight: field.multiline ? 96 : undefined,
                    }}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={{ marginBottom: 25 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 10 }}>
                Personal Information
              </Text>

              {[
                ["First Name", customer.firstName],
                ["Last Name", customer.lastName],
                ["Email", customer.email],
                ["Phone", customer.phone],
                ["Address", customer.address],
                ["Referred By Leader", customer.referredByLeaderId],
              ].map(([label, value]) => (
                <View
                  key={label}
                  style={{
                    backgroundColor: "#fff",
                    padding: 12,
                    borderRadius: 12,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>{label}</Text>
                  <Text style={{ fontWeight: "600", fontSize: 16 }}>
                    {value || "—"}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ marginBottom: 25 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 10 }}>
              Bank Accounts
            </Text>

            {customer.bankAccounts?.length ? (
              customer.bankAccounts.map((acc) => (
                <View
                  key={acc.id}
                  style={{
                    backgroundColor: "#fff",
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>{acc.bankName}</Text>
                  <Text style={{ color: "#6b7280", marginTop: 4 }}>
                    A/C: {acc.accountNumber}
                  </Text>
                  <Text style={{ color: "#6b7280" }}>IFSC: {acc.ifscCode}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "#6b7280", marginTop: 10 }}>
                No bank accounts added.
              </Text>
            )}
          </View>

          <View>
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 10 }}>
              Documents
            </Text>

            {[
              ["Aadhar Front", doc("aadhar_front")?.fileUrl],
              ["Aadhar Back", doc("aadhar_back")?.fileUrl],
              ["PAN Card", doc("pan")?.fileUrl],
              ["Passbook", doc("passbook")?.fileUrl],
            ].map(([label, url]) => {
              const fullUrl = url ? `${staticUrl}${url}` : null;
              const fileName = url ? url.split("/").slice(-2).join("/") : null;

              return (
                <TouchableOpacity
                  key={label}
                  onPress={() => fullUrl && setPreviewUrl(fullUrl)}
                  activeOpacity={0.9}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    elevation: 2,
                  }}
                >
                  <View
                    style={{
                      width: 55,
                      height: 55,
                      borderRadius: 10,
                      marginRight: 12,
                      backgroundColor: "#f3f4f6",
                      overflow: "hidden",
                    }}
                  >
                    {fullUrl ? (
                      <Image
                        source={{ uri: fullUrl }}
                        style={{
                          width: "100%",
                          height: "100%",
                          resizeMode: "cover",
                        }}
                      />
                    ) : (
                      <View
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Feather name="image" size={22} color="#9ca3af" />
                      </View>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "700", fontSize: 16 }}>
                      {label}
                    </Text>
                    <Text style={{ color: "#6b7280", fontSize: 12 }}>
                      {fileName || "Not uploaded"}
                    </Text>
                  </View>

                  <Feather name="chevron-right" size={18} color="#9ca3af" />
                </TouchableOpacity>
              );
            })}
          </View>

          <Modal visible={!!previewUrl} transparent animationType="fade">
            <TouchableOpacity
              onPress={() => setPreviewUrl(null)}
              activeOpacity={1}
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.9)",
              }}
            >
              <Image
                source={{ uri: previewUrl }}
                style={{
                  width: "90%",
                  height: "75%",
                  resizeMode: "contain",
                  borderRadius: 12,
                }}
              />
            </TouchableOpacity>
          </Modal>

          <View style={{ marginTop: 30 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "800" }}>Investments</Text>

              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/customers/add-investment",
                    params: { customerId: id },
                  })
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#2563eb",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 10,
                }}
              >
                <Feather name="plus" size={16} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>

            {customer.investments?.length ? (
              customer.investments.map((inv) => (
                <View
                  key={inv.id}
                  style={{
                    backgroundColor: "#fff",
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                  }}
                >
                  <Text style={{ fontWeight: "700", fontSize: 16 }}>
                    ₹{inv.principalAmount.toLocaleString("en-IN")}
                  </Text>
                  <Text style={{ color: "#6b7280" }}>
                    {inv.type === "fd"
                      ? "Fixed Deposit"
                      : inv.type === "rd"
                      ? "Recurring Deposit"
                      : "FD+ (10% for 20M)"}
                  </Text>

                  <Text style={{ marginTop: 4, fontSize: 12, color: "#6b7280" }}>
                    Status: {inv.status}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "#6b7280" }}>No investments yet.</Text>
            )}
          </View>
        </ScrollView>

        {isEditing && (
          <View
            style={{
              padding: 16,
              borderTopWidth: 1,
              borderColor: "#e5e7eb",
              backgroundColor: "#fff",
              flexDirection: "row",
              gap: 10,
            }}
          >
            <TouchableOpacity
              onPress={handleCancelEdit}
              disabled={saving}
              style={{
                flex: 1,
                height: 52,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#d1d5db",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#fff",
              }}
            >
              <Text style={{ fontWeight: "700", color: "#374151" }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                flex: 1.4,
                height: 52,
                borderRadius: 14,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#2563eb",
              }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ fontWeight: "700", color: "#fff" }}>
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
