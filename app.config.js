// app.config.js
// This file replaces the static app.json for dynamic configuration.
// It evaluates process.env at prebuild time so the actual API key value
// is embedded into AndroidManifest.xml — NOT the literal string "process.env...".

export default {
  name: "Ilocos Sur Property",
  slug: "ilocos_sur_property",
  version: "1.0.1",
  orientation: "portrait",
  icon: "./assets/images/ilocos-sur-icon.png",
  scheme: "ilocossurproperty",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
  },
  android: {
    config: {
        googleMaps: {
          apiKey: "GOOGLE_MAPS_API"
        }
      },
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/ilocos-sur-icon.png",
      backgroundImage: "./assets/images/ilocos-sur-icon.png",
      monochromeImage: "./assets/images/ilocos-sur-icon.png",
    },
    predictiveBackGestureEnabled: false,
    package: "com.anonymous.ilocos_sur_property",
    
  },
  web: {
    output: "static",
    favicon: "./assets/images/ilocos-sur-icon.png",
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/ilocos-sur-splash.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    "expo-font",
    "expo-image",
    "expo-web-browser",
    [
      "react-native-maps",
      {
          androidGoogleMapsApiKey: "GOOGLE_MAPS_API"
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {
      origin: process.env.EXPO_PUBLIC_SITE_URL,
    },
    eas: {
      projectId: "859603f1-96ae-4fed-8da0-549418f14604",
    },
  },
};
