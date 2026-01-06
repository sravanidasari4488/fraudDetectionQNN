import { Stack } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IntroLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}