import 'dotenv/config';

export default {
  expo: {
    name: "Only Click",
    slug: "only-click-user",
    version: "1.0.2",
    orientation: "portrait",
    icon: "./assets/images/mainicon.png",
    scheme: "onlyclick",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/mainicon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      icon: "./assets/images/mainicon.png",
      bundleIdentifier: "com.onlyclick.userapp",
    },
    android: {
      icon: "./assets/images/mainicon.png",
      adaptiveIcon: {
        foregroundImage: "./assets/images/mainicon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.onlyclick.user",
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.RECORD_AUDIO",
      ],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      // Facebook App Events plugin (react-native-fbsdk-next)
      [
        "react-native-fbsdk-next",
        {
          "appID": "YOUR_FACEBOOK_APP_ID",
          "clientToken": "YOUR_FACEBOOK_CLIENT_TOKEN",
          "displayName": "YOUR_FACEBOOK_APP_DISPLAY_NAME"
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "This app needs access to your location to show nearby services and providers.",
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app accesses your photos to let you share images of your service requests.",
          cameraPermission:
            "The app accesses your camera to let you take photos of your service requests.",
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            enable16KbPageSize: true,
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        src: "src/app"
      },
      eas: {
        projectId: "ae7a880b-bb8e-4d86-a99c-f0bde28eeede"
      },
      // Support both NEXT_PUBLIC_ and EXPO_PUBLIC_ prefixes
      expoPublicSupabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL,
      expoPublicSupabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      expoPublicRazorPayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
      expoPublicApiUrl: process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL,
      googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
  },
};