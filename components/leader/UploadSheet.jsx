import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  MediaTypeOptions,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  StyleSheet,
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

  const handleImageSelection = async (mode) => {
    try {
      let result;
      if (mode === "camera") {
        const { status } = await requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Camera access is required.");
          return;
        }
        result = await launchCameraAsync({
          allowsEditing: false,
          quality: 0.7,
        });
      } else {
        const { status } = await requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Gallery access is required.");
          return;
        }
        result = await launchImageLibraryAsync({
          mediaTypes: MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.7,
        });
      }

      if (!result.canceled && result.assets?.length > 0) {
        await uploadFile(result.assets[0]);
      }
    } catch (err) {
      console.log("Picker Error:", err);
      Alert.alert("Error", "Could not select image.");
    }
  };

  const uploadFile = async (asset) => {
    if (!resolvedType) return;

    setUploading(true);
    try {
      const uri =
        Platform.OS === "android" ? asset.uri : asset.uri.replace("file://", "");
      const fileType = uri.split(".").pop();
      const fileName = `upload_${Date.now()}.${fileType}`;
      const mimeType = asset.mimeType || `image/${fileType === "jpg" ? "jpeg" : fileType}`;

      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        name: fileName,
        type: mimeType,
      });

      const endpoint = `/upload?type=${resolvedType}&customerId=${customerId}`;
      
      const res = await axiosAuth().post(endpoint, formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        transformRequest: (data) => data,
      });

      const fileUrl = res.data?.document?.file_url || res.data?.file_url;
      if (fileUrl) {
        onSuccess(type, fileUrl);
      } else {
        throw new Error("No URL returned");
      }
    } catch (error) {
      console.error("Upload Failed:", error);
      Alert.alert("Upload Failed", "Please try again.");
      onClose();
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal transparent animationType="slide" visible={true} onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet}>
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          <View style={styles.header}>
            <Text style={styles.title}>Upload Document</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {uploading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Uploading securely...</Text>
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionBtn}
                onPress={() => handleImageSelection("camera")}
              >
                <View style={[styles.iconBox, { backgroundColor: "#EFF6FF" }]}>
                  <Ionicons name="camera" size={24} color="#2563EB" />
                </View>
                <Text style={styles.optionText}>Take Photo</Text>
                <Ionicons name="chevron-forward" size={20} color="#E5E7EB" />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.optionBtn}
                onPress={() => handleImageSelection("gallery")}
              >
                <View style={[styles.iconBox, { backgroundColor: "#F0FDF4" }]}>
                  <Ionicons name="images" size={24} color="#16A34A" />
                </View>
                <Text style={styles.optionText}>Choose from Gallery</Text>
                <Ionicons name="chevron-forward" size={20} color="#E5E7EB" />
              </TouchableOpacity>
            </View>
          )}
          <View style={{ height: 20 }} /> 
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  handleBar: { width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  closeBtn: { padding: 4, backgroundColor: "#F3F4F6", borderRadius: 20 },
  loadingContainer: { padding: 40, alignItems: "center" },
  loadingText: { marginTop: 12, color: "#6B7280", fontWeight: "500" },
  optionsContainer: { backgroundColor: "#fff" },
  optionBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", marginRight: 16 },
  optionText: { flex: 1, fontSize: 16, fontWeight: "600", color: "#1F2937" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginLeft: 64 },
});