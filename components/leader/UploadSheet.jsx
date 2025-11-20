import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import {
  launchImageLibraryAsync,
  MediaTypeOptions,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function UploadSheet({ type, customerId, onClose, onSuccess }) {
  const { axiosAuth } = useAuth();
  const [uploading, setUploading] = useState(false);

  // Backend Key Mapping
  const backendTypeMap = {
    aadharFront: "aadhar_front",
    aadharBack: "aadhar_back",
    pan: "pan",
    passbook: "passbook",
  };

  const resolvedType = backendTypeMap[type];

  const pickFile = async () => {
    try {
      const { status } = await requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please allow access to photos to upload documents."
        );
        return;
      }

      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7, // Good balance for upload size
      });

      if (!result.canceled && result.assets?.length > 0) {
        await uploadFile(result.assets[0]);
      }
    } catch (err) {
      console.log("ImagePicker Error:", err);
      Alert.alert("Error", "Could not open gallery.");
    }
  };

  const uploadFile = async (asset) => {
    if (!resolvedType) {
      Alert.alert("Error", "Configuration error: Invalid upload type.");
      return;
    }

    setUploading(true);
    try {
      const uri = asset.uri;
      
      // FIX 1: Platform specific URI handling
      // Android keeps 'file://', iOS usually prefers it removed for FormData
      const uriForUpload = Platform.OS === "android" ? uri : uri.replace("file://", "");

      const fileType = uri.split(".").pop();
      const fileName = `upload_${Date.now()}.${fileType}`;
      // FIX 2: Ensure Valid Mime Type
      const mimeType = asset.mimeType || `image/${fileType === 'jpg' ? 'jpeg' : fileType}`;

      const formData = new FormData();
      
      // FIX 3: Only append 'file' to body (Matches your Web Logic)
      formData.append("file", {
        uri: uriForUpload,
        name: fileName,
        type: mimeType,
      });

      
      const endpoint = `/upload?type=${resolvedType}&customerId=${customerId}`;
      console.log(`Uploading to: ${endpoint}`);

      const res = await axiosAuth().post(endpoint, formData, {
        headers: {
          "Accept": "application/json",
          "Content-Type": "multipart/form-data",
        },
        transformRequest: (data) => data, // Prevent Axios from stringifying FormData
      });

      const fileUrl = res.data?.document?.file_url || res.data?.file_url;

      if (fileUrl) {
        console.log("Upload Success:", fileUrl);
        onSuccess(type, fileUrl);
      } else {
        throw new Error("Server response missing file URL.");
      }

    } catch (error) {
      console.error("Upload Failed:", error);
      
      if (error.response) {
        console.log("Server Data:", error.response.data);
        Alert.alert("Upload Failed", error.response.data?.message || "Server rejected the file.");
      } else if (error.message === "Network Error") {
        Alert.alert("Network Error", "Check internet connection. If using Localhost, use IP Address.");
      } else {
        Alert.alert("Upload Failed", "An unexpected error occurred.");
      }
      onClose();
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={true}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            padding: 24,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: 40,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#1f2937" }}>
              Upload Document
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
              <Ionicons name="close-circle" size={26} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {uploading ? (
            <View style={{ padding: 30, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text
                style={{ marginTop: 12, color: "#6b7280", fontWeight: "500" }}
              >
                Uploading securely...
              </Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                onPress={pickFile}
                style={{
                  backgroundColor: "#2563eb",
                  padding: 16,
                  borderRadius: 14,
                  marginBottom: 12,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="images-outline"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}
                >
                  Choose from Gallery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                style={{
                  backgroundColor: "#f3f4f6",
                  padding: 16,
                  borderRadius: 14,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "#374151",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}