import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import StandaloneProfileForm from "../../../components/Profile/StandaloneProfileForm";
import Text from "../../../components/ui/Text";
import { useAppStates } from "../../../context/AppStates";
import { useAuth } from "../../../context/AuthProvider";
import supabase from "../../../data/supabaseClient";

export default function ProfileSetup() {
  const { user, setUser } = useAuth();
  const { markProfileCompleted } = useAppStates();
  const [isFormValid, setIsFormValid] = useState(false);

  const handleValidationChange = (isValid) => {
    setIsFormValid(isValid);
  };

  useEffect(() => {
    const checkNewUser = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        return;
      }
      if (!user) {
        return;
      }


      // 2️⃣ Query the profile in onlyclick.users
      const { data, error } = await supabase
      .schema('onlyclick')
        .from("users")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      if (error) {
        return;
      }
      
      
      if(data.full_name){
          router.replace("/(app)/protected/(tabs)/Home");
      }
      else{
        return;
      }


    };

    checkNewUser();
  }, []);

  const handleProceed = async () => {
    // Navigate to main app since profile is already saved by StandaloneProfileForm
    router.replace("/(app)/protected/(tabs)/Home");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Please fill in your details to get started
          </Text>
        </View>

        <View style={styles.formContainer}>
          <StandaloneProfileForm 
            onValidationChange={handleValidationChange}
            onProceed={handleProceed}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30, // Reduced padding since no button at bottom
  },
  header: {
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
});
