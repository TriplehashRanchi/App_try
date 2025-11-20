import { Modal, Share, Text, TouchableOpacity, View } from "react-native";

export default function ShareModal({ visible, onClose, url }) {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check this offer: ${url}`,
      });
    } catch (err) {
      console.log("Share Error", err);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 360,
            backgroundColor: "#fff",
            padding: 24,
            borderRadius: 18,
            elevation: 5,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Share Offer
          </Text>

          <TouchableOpacity
            onPress={handleShare}
            style={{
              backgroundColor: "#2563eb",
              paddingVertical: 12,
              borderRadius: 10,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: "#fff",
                textAlign: "center",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Share Now
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: "#e5e7eb",
              paddingVertical: 12,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: "#111",
                textAlign: "center",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
