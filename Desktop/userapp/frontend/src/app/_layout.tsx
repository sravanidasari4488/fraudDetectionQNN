import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from "react-native";
import { AppEventsLogger, Settings } from 'react-native-fbsdk-next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Text from "../components/ui/Text";
import { AppStatesProvider } from "../context/AppStates";
import AuthProvider from "../context/AuthProvider";
import ModalProvider from "../context/ModalProvider";


export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });
  

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();

    // Initialize Facebook SDK early (measuring installs & app events)
    try {
      Settings.initializeSDK();
      // log activation event - helps with install measurement and activation tracking
      AppEventsLogger.logEvent('fb_mobile_activate_app');
    } catch (err) {
      // ignore initialization errors in JS runtime; native may not be ready until prebuild
      // console.warn('FB SDK init error', err);
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);









  if (!fontsLoaded) {
    return null;
  }
  

  // Create a custom Text component to apply the default font family
  const AppText = (props: React.ComponentProps<typeof Text>) => (
    <Text {...props} style={[{ fontFamily: 'Poppins_400Regular' }, props.style]} />
  );
  // For TextInput, wrap it in a custom component if you want to apply default styles
  // Example:
  // const CustomTextInput = (props) => <TextInput style={[{ fontFamily: 'Poppins_400Regular' }, props.style]} {...props} />;

  return (
    <SafeAreaProvider>
      <AppStatesProvider>
        <AuthProvider>
          <ModalProvider>
            <View style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="intro" options={{ headerShown: false }} />
                <Stack.Screen name="(app)" options={{ headerShown: false }} />
              </Stack>
            <Toast
              position="bottom"
              bottomOffset={20}
              config={{
                success: (props) => (
                  <View style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: 10,
                    padding: 12,
                    marginHorizontal: 16,
                    marginBottom: 8,
                    borderLeftWidth: 3,
                    borderLeftColor: '#00D4AA',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 6,
                    borderWidth: 1,
                    borderColor: '#333',
                    minWidth: 280,
                    maxWidth: 320,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: '#00D4AA',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 10,
                      }}>
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          color: '#FFFFFF',
                          fontSize: 14,
                          fontWeight: '600',
                          marginBottom: 1,
                          fontFamily: 'Poppins_600SemiBold'
                        }}>
                          {props.text1}
                        </Text>
                        <Text style={{
                          color: '#E0E0E0',
                          fontSize: 12,
                          fontFamily: 'Poppins_400Regular'
                        }}>
                          {props.text2}
                        </Text>
                      </View>
                    </View>
                  </View>
                ),
                error: (props) => (
                  <View style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: 10,
                    padding: 12,
                    marginHorizontal: 16,
                    marginBottom: 8,
                    borderLeftWidth: 3,
                    borderLeftColor: '#FF6B6B',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 6,
                    borderWidth: 1,
                    borderColor: '#333',
                    minWidth: 280,
                    maxWidth: 320,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: '#FF6B6B',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 10,
                      }}>
                        <Ionicons name="close" size={14} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          color: '#FFFFFF',
                          fontSize: 14,
                          fontWeight: '600',
                          marginBottom: 1,
                          fontFamily: 'Poppins_600SemiBold'
                        }}>
                          {props.text1}
                        </Text>
                        <Text style={{
                          color: '#E0E0E0',
                          fontSize: 12,
                          fontFamily: 'Poppins_400Regular'
                        }}>
                          {props.text2}
                        </Text>
                      </View>
                    </View>
                  </View>
                ),
              }}
            />
          </View>
        </ModalProvider>
      </AuthProvider>
    </AppStatesProvider>
    </SafeAreaProvider>
  );
}
