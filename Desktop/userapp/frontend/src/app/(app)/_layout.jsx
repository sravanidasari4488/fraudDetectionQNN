import { Stack } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>
      <Stack initialRouteName="protected">
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="protected" options={{ headerShown: false }} />
        <Stack.Screen 
          name="(modal)" 
          options={{ 
            headerShown: false,
            presentation: 'modal',
            gestureEnabled: true
          }} 
        />
      </Stack>
    </SafeAreaView>
  );
}
