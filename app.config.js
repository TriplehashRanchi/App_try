export default {
  expo: {
    name: "Rm Club",
    slug: "rm-club",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    extra: {
      eas: {
        projectId: "a897288f-2a10-47d6-9e76-e1e6a5770210"
      }
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: "co.rmclubranchi.app",
      buildNumber: "1.0.0",
      infoPlist: {
        NSCameraUsageDescription: "This app uses the camera to scan QR codes.",
        NSPhotoLibraryUsageDescription: "This app needs access to your photo library to select profile pictures."
      }
    },
    android: {
      package: "com.rmclubranchi.app",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/icon.png",
        backgroundImage: "./assets/images/icon.png",
        monochromeImage: "./assets/images/icon.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },

    web: {
      output: "static",
      favicon: "./assets/images/icon.png"
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: { backgroundColor: "#000000" }
        }
      ]
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true
    }
  }
};
