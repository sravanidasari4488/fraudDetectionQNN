import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ModalLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>
      <Stack>
        <Stack.Screen 
          name="cart" 
          options={{ 
            headerShown: false,
            presentation: 'modal',
            gestureEnabled: true,
            animation: 'slide_from_bottom'
          }} 
        />
      </Stack>
    </SafeAreaView>
  );
}
