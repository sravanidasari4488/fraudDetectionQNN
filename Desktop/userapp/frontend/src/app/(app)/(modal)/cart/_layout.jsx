import { Stack } from 'expo-router';

export default function CartLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          presentation: 'modal',
          gestureEnabled: true,
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}