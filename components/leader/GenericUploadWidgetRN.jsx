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
    View
} from "react-native";

export default function GenericUploadWidgetRN({
  visible,
  onClose,
  endpoint,
  label,
  onSuccess,
  type,
}) {
  const { axiosAuth } = useAuth();
  const [uploading, setUploading] = useState(false);

  const pickImage = async (source) => {
    try {
      let permission =
        source === "camera"
          ? await requestCameraPermissionsAsync()
          : await requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        return Alert.alert("Permission required", "Please allow access.");
      }

      const result =
        source === "camera"
          ? await launchCameraAsync({ quality: 0.7 })
          : await launchImageLibraryAsync({
              mediaTypes: MediaTypeOptions.All,
              quality: 0.7,
            });

      if (!result.canceled && result.assets?.length > 0) {
        uploadFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert("Error", "Could not open picker.");
    }
  };

  const uploadFile = async (asset) => {
    setUploading(true);

    try {
      const uri =
        Platform.OS === "ios" ? asset.uri.replace("file://", "") : asset.uri;

      const fileName = uri.split("/").pop();
      const extension = fileName.split('.').pop().toLowerCase();

      let fileType =
        asset.mimeType ||
        (extension === "pdf"
          ? "application/pdf"
          : "image/jpeg");

      const formData = new FormData();
      formData.append("file", { uri, name: fileName, type: fileType });

      const res = await axiosAuth().post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("UPLOAD RESPONSE:", res.data);

      const fileUrl = res.data?.document?.file_url || res.data?.file_url;
      console.log("FILE URL:", fileUrl);

      if (!fileUrl) throw new Error("No file_url returned");

      onSuccess(type, fileUrl);
      onClose();
    } catch (error) {
      Alert.alert("Upload failed", "Please try again.");
      console.log("UPLOAD ERROR", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.sheet}>
          
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <View style={styles.dragHandle} />
            <Text style={styles.title}>{label}</Text>
            <Text style={{ color: "#6b7280", fontSize: 13 }}>
              Upload clear, readable documents only
            </Text>
          </View>

          {uploading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={{ marginTop: 8, fontSize: 15, color: "#374151" }}>
                Uploading...
              </Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.option}
                onPress={() => pickImage("camera")}
              >
                <Ionicons name="camera" size={24} color="#2563EB" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.optionText}>Take Photo</Text>
                  <Text style={styles.optionSub}>Use your phone camera</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.option}
                onPress={() => pickImage("gallery")}
              >
                <Ionicons name="image" size={24} color="#10B981" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.optionText}>Choose from Gallery</Text>
                  <Text style={styles.optionSub}>Select image or PDF</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    padding: 22,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  optionSub: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  center: {
    alignItems: "center",
    paddingVertical: 20,
  },
});
