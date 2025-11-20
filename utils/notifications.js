import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

export async function registerForPushNotificationsAsync() {
  try {
    if (!Device.isDevice) return null;

    // Ask permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("❌ Notification permission NOT granted");
      return null;
    }

    // ────────────────────────────────────────────────
    // SAFE PROJECT ID GETTER
    // ────────────────────────────────────────────────
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.easConfig?.projectId ||
      Constants?.expoConfig?.projectId;

    if (!projectId) {
      console.log("❌ No projectId found in Constants");
      return null;
    }

    // Fetch expo push token
    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;

    console.log("📲 Expo Push Token:", token);
    return token;
  } catch (error) {
    console.log("Notification error:", error);
    return null;
  }
}
