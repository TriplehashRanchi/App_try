import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

const PUBLIC_WEB_BASE_URL = "https://rmclub.co";

function resolvePublicUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  try {
    return new URL(value, PUBLIC_WEB_BASE_URL).toString();
  } catch {
    return value;
  }
}

export default function LeaderReferralQrScreen() {
  const { axiosAuth, user, loading } = useAuth();
  const [qrData, setQrData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadQrLink = async () => {
      if (loading) return;
      if (!axiosAuth) {
        if (mounted) {
          setError("Authentication client is unavailable.");
          setPageLoading(false);
        }
        return;
      }

      setPageLoading(true);
      setError("");
      try {
        const { data } = await axiosAuth().get("/leaders/me/qr-link");
        if (!mounted) return;
        setQrData(data);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || "Failed to load your referral QR link.");
      } finally {
        if (mounted) setPageLoading(false);
      }
    };

    loadQrLink();

    return () => {
      mounted = false;
    };
  }, [axiosAuth, loading, reloadKey]);

  const qrLink = useMemo(() => resolvePublicUrl(qrData?.qrLink || ""), [qrData?.qrLink]);

  const handleShare = async () => {
    if (!qrLink) return;
    try {
      await Share.share({
        title: "RM Club Registration Link",
        message: `Register with my RM Club referral code ${qrData?.leaderCode || ""}\n${qrLink}`,
      });
    } catch (err) {
      setError(err?.message || "Could not open share sheet.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Referral QR</Text>
          <Text style={styles.headerSub}>Share your personal registration link</Text>
        </View>
      </View>

      <View style={styles.content}>
        {pageLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color="#0EA5E9" />
            <Text style={styles.stateText}>Loading your QR...</Text>
          </View>
        ) : null}

        {!pageLoading && error ? (
          <View style={styles.stateCard}>
            <Ionicons name="alert-circle-outline" size={26} color="#E11D48" />
            <Text style={[styles.stateText, { color: "#BE123C" }]}>{error}</Text>
            <TouchableOpacity
              onPress={() => {
                setError("");
                setReloadKey((prev) => prev + 1);
              }}
              style={styles.retryBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!pageLoading && !error && qrData ? (
          <>
            <View style={styles.qrCard}>
              <View style={styles.qrWrap}>
                {qrLink ? (
                  <QRCode value={qrLink} size={220} color="#0F172A" backgroundColor="#FFFFFF" />
                ) : (
                  <Text style={styles.emptyQrText}>QR link unavailable</Text>
                )}
              </View>
              <Text style={styles.qrCaption}>Scan to open registration with your referral</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.label}>Leader</Text>
              <View style={styles.row}>
                <Text style={styles.leaderName}>{qrData.leaderName || user?.username || "Leader"}</Text>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeBadgeText}>{qrData.leaderCode || "N/A"}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.label}>Referral Link</Text>
              <Text style={styles.linkText}>{qrLink || "-"}</Text>
              <TouchableOpacity
                onPress={handleShare}
                disabled={!qrLink}
                activeOpacity={0.85}
                style={[styles.shareButton, !qrLink && styles.shareButtonDisabled]}
              >
                <Ionicons name="share-social-outline" size={18} color="#fff" />
                <Text style={styles.shareButtonText}>Share Link</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>How to use</Text>
              <Text style={styles.tipText}>1. Show this QR to the customer.</Text>
              <Text style={styles.tipText}>2. Or tap Share Link and send it on WhatsApp.</Text>
              <Text style={styles.tipText}>3. Customer opens registration with your referral code.</Text>
            </View>
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSub: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  content: {
    padding: 16,
    gap: 14,
  },
  stateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
  },
  stateText: {
    marginTop: 10,
    color: "#334155",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 12,
    backgroundColor: "#0F172A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  qrCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    alignItems: "center",
  },
  qrWrap: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyQrText: {
    color: "#64748B",
    fontWeight: "600",
  },
  qrCaption: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
  },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#64748B",
    fontWeight: "700",
  },
  row: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  leaderName: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  codeBadge: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  codeBadgeText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "800",
  },
  linkText: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    color: "#334155",
    fontSize: 13,
    lineHeight: 18,
  },
  shareButton: {
    marginTop: 12,
    backgroundColor: "#0EA5E9",
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  tipCard: {
    backgroundColor: "#ECFEFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CFFAFE",
    padding: 14,
  },
  tipTitle: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
  },
  tipText: {
    color: "#155E75",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
});
