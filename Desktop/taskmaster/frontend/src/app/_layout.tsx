import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useEffect } from "react";
import { Platform } from "react-native";
import { AppStatesProvider } from "../context/AppStates";
import AuthProvider from "../context/AuthProvider";
import ModalProvider from "../context/ModalProvider";
import { SocketProvider } from "../context/SocketContext";
import { BookingsProvider } from "../context/bookingsContext";
import { initializeFCM } from "../services/notificationService";
import UpdateChecker from "../components/common/UpdateChecker";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Initialize Firebase Cloud Messaging on Android
  useEffect(() => {
    if (Platform.OS === 'android' && fontsLoaded) {
      initializeFCM().catch((error) => {
        console.error('Failed to initialize FCM:', error);
      });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4ab9cf" />
      </View>
    );
  }

  return (
    <AppStatesProvider>
      <AuthProvider>
        <SocketProvider>
          <ModalProvider>
            <BookingsProvider>
              <UpdateChecker />
              <View style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="intro" options={{ headerShown: false }} />
                  <Stack.Screen name="(app)" options={{ headerShown: false }} />
                </Stack>
              </View>
            </BookingsProvider>
          </ModalProvider>
        </SocketProvider>
      </AuthProvider>
    </AppStatesProvider>
  );
}
