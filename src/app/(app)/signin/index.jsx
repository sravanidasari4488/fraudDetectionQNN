// src/app/signin/index.tsx
import { View } from "react-native";
import LoginScreen from "../../../components/SignIn/SignInForm";

export default function SignInScreen() {
  return (
    <View style={{ flex: 1 }}>
      <LoginScreen />
    </View>
  );
}
