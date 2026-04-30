import { Alert, Linking } from "react-native";
import { API_BASE_URL } from "./axiosAuth";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const getAgreementUrl = (investment) => {
  const agreementUrl = investment?.agreementFileUrl;

  if (!investment?.hasAgreement || !agreementUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(agreementUrl)) {
    return agreementUrl;
  }

  return `${API_ORIGIN}${
    agreementUrl.startsWith("/") ? "" : "/"
  }${agreementUrl}`;
};

export const openAgreement = async (investment) => {
  const url = getAgreementUrl(investment);

  if (!url) {
    Alert.alert(
      "Agreement unavailable",
      "No agreement file is attached to this investment."
    );
    return;
  }

  try {
    await Linking.openURL(url);
  } catch (error) {
    console.log("Agreement download error:", error);
    Alert.alert("Unable to open agreement", "Please try again later.");
  }
};
