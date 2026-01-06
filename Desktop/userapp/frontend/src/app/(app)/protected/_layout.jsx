import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import CartSuccessModal from "../../../components/common/CartSuccessModal";
import CustomServiceModal from "../../../components/common/CustomServiceModal";
import EnterAmountModal from "../../../components/common/EnterAmountModal";
import PressableScale from "../../../components/common/PressableScale";
import SuccessModal from "../../../components/common/SuccessModal";

export default function RootLayout() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>
      <View style={{ flex: 1 }}>
        <Stack initialRouteName="(tabs)">
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="Notification" options={{ presentation: "modal" }} />
          <Stack.Screen
            name="[customJob]"
            options={{
              headerTitle: "Custom Job",
              headerLeft: () => {
                return (
                  <PressableScale
                    onPress={() => {
                      router.back("");
                    }}
                    style={{ left: 10, marginRight: 50 }}
                  >
                    <Ionicons name="arrow-back" size={25} color="black" />
                  </PressableScale>
                );
              },
            }}
          />
        </Stack>
        <CustomServiceModal />
        <EnterAmountModal />
        <SuccessModal />
        <CartSuccessModal />
      </View>
    </SafeAreaView>
  );
}
