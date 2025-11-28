import { useAuth } from "@/context/AuthContext";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CreateInvestmentModal from "./CreateInvestmentModal";

export default function CustomerDetailPage() {
  const { id } = useLocalSearchParams();
  const { axiosAuth } = useAuth();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const staticUrl = "https://api.rmclub.co";

  const fetchCustomer = useCallback(async () => {
    if (!axiosAuth || !id) return;
    try {
      setLoading(true);
      const res = await axiosAuth().get(`/customers/${id}`);
      setCustomer(res.data);
    } catch (err) {
      console.log("Customer fetch error", err);
      router.push("/customers");
    } finally {
      setLoading(false);
    }
  }, [axiosAuth, id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );

  if (!customer)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Customer not found.</Text>
      </View>
    );

  const doc = (type) => customer?.documents?.find((d) => d.type === type);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* BACK BUTTON */}
        <TouchableOpacity
          onPress={() => router.push("/customers")}
          style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
        >
          <Feather name="arrow-left" size={20} color="#374151" />
          <Text style={{ marginLeft: 6, fontWeight: "600", color: "#374151" }}>
            Back
          </Text>
        </TouchableOpacity>

        {/* HEADER */}
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
        </View>

        {/* ========================================================= */}
        {/*                  SECTION 1 — PROFILE BUNDLE              */}
        {/* ========================================================= */}

        <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 12 }}>
          Profile Details
        </Text>

        {/* PERSONAL INFO */}
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

        {/* BANK ACCOUNTS */}
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

        {/* DOCUMENTS */}
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
                      style={{ width: "100%", height: "100%", resizeMode: "cover" }}
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

        {/* IMAGE PREVIEW MODAL */}
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

        {/* ========================================================= */}
        {/*                     SECTION 2 — INVESTMENTS               */}
        {/* ========================================================= */}

        <View style={{ marginTop: 30 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "800" }}>
              Investments
            </Text>

            <TouchableOpacity
              onPress={() => setShowInvestmentModal(true)}
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
              <Text
                style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}
              >
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

                <Text
                  style={{ marginTop: 4, fontSize: 12, color: "#6b7280" }}
                >
                  Status: {inv.status}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ color: "#6b7280" }}>No investments yet.</Text>
          )}

          {showInvestmentModal && (
            <CreateInvestmentModal
              visible={showInvestmentModal}
              customerId={id}
              onClose={() => setShowInvestmentModal(false)}
              onCreated={() => fetchCustomer()}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
