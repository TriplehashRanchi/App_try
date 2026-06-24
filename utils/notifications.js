import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

export async function registerForPushNotificationsAsync() {
  try {
    if (!Device.isDevice) return null;

    // Remote push was removed from Expo Go (SDK 53+). Skip registration there
    // to avoid the unsupported-API error; use a development build for push.
    if (Constants.executionEnvironment === "storeClient") {
      console.log("ℹ️ Skipping push registration in Expo Go");
      return null;
    }

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
