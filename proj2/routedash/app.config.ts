import "dotenv/config";
import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "RouteDash",
  slug: "routedash",
  version: "0.1.0",
  orientation: "portrait",
  scheme: "routedash",
  userInterfaceStyle: "automatic",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0f172a"
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.routedash.mobile",
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? ""
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0f172a"
    },
    package: "com.routedash.mobile",
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY ?? ""
      }
    }
  },
  web: {
    bundler: "metro",
    favicon: "./assets/favicon.png"
  },
  extra: {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",
    eas: {
      projectId: "00000000-0000-4000-8000-000000000000"
    }
  },
  plugins: [
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static"
        },
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          kotlinVersion: "1.9.24"
        }
      }
    ]
  ]
};

export default config;
