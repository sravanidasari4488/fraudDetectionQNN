import { Ionicons } from "@expo/vector-icons";
import { router as Router } from 'expo-router';
import { useEffect, useState } from "react";
import { Dimensions, Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import AdvancedOptions from "../../../../../components/Profile/AdvancedOptions";
import BottomLinks from "../../../../../components/Profile/BottomLinks";
import ProfileForm from "../../../../../components/Profile/ProfileForm";
import ProfileHeader from "../../../../../components/Profile/ProfileHeader";
import AppHeader from '../../../../../components/common/AppHeader';
import ConfirmModal from '../../../../../components/common/ConfirmModal';
import Text from "../../../../../components/ui/Text";
import { useAppStates } from "../../../../../context/AppStates";
import { useAuth } from "../../../../../context/AuthProvider";
import supabase from "../../../../../data/supabaseClient";
import { clearAllAppStorage } from "../../../../../utils/storage";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Dynamic header sizing
const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 20;
const HEADER_BASE = Math.max(56, screenHeight * 0.09); // base header height (min 56)
const HEADER_HEIGHT = statusBarHeight + HEADER_BASE;

const ProfilePage = () => {
  const [isGeneral, setIsGeneral] = useState(true);
  const { isProfileCompleted, markProfileCompleted, resetAppStatesForLogout } = useAppStates();
  const { setUser, setIsLoggedIn, setAuthToken, setIsNewUser } = useAuth();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleProfileUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    // Show welcome message if profile is not completed
    if (isProfileCompleted === false) {
      setShowWelcomeMessage(true);
    }
  }, [isProfileCompleted]);

  const handleSaveProfile = async (formData) => {
    try {
      // Here you would typically save to backend
      await markProfileCompleted();
      setSavedModal({ visible: true, title: 'Profile Saved!', message: 'Your profile has been updated successfully.', buttons: [{ text: 'Continue' }] });
    } catch (error) {
      setSavedModal({ visible: true, title: 'Error', message: 'Failed to save profile. Please try again.' });
    }
  };

  const router = Router;

  const [savedModal, setSavedModal] = useState({ visible: false, title: null, message: null, buttons: null });
  const [logoutModal, setLogoutModal] = useState({ visible: false, title: null, message: null, buttons: null });

  const handleLogout = () => {
    setLogoutModal({
      visible: true,
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: async () => {
          try {
            // Clear all app storage except appOpenedFirstTime
            await clearAllAppStorage();
            
            // Reset all app states to defaults
            resetAppStatesForLogout();
            
            // Reset auth context states
            setUser(null);
            setIsLoggedIn(false);
            setAuthToken("");
            setIsNewUser(null);
            
            // Sign out from Supabase
            await supabase.auth.signOut();
            
            // Navigate to sign-in
            router.replace('/auth/sign-in');
          } catch (error) {
            console.error('Logout error:', error);
            // Still navigate to sign-in even if cleanup fails
            router.replace('/auth/sign-in');
          }
        } }
      ]
    });
  };

  return (
    <View style={styles.container}>
      <ConfirmModal visible={savedModal.visible} title={savedModal.title} message={savedModal.message} buttons={savedModal.buttons} onRequestClose={() => setSavedModal({ visible: false })} />
      <ConfirmModal visible={logoutModal.visible} title={logoutModal.title} message={logoutModal.message} buttons={logoutModal.buttons} onRequestClose={() => setLogoutModal({ visible: false })} />
      <AppHeader
        title="My Profile"
        showBack={true}
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingTop: 16 }]}
        showsVerticalScrollIndicator={false}
      >
        

        <ProfileHeader
          key={refreshKey}
          isGeneral={isGeneral}
          setIsGeneral={setIsGeneral}
          onProfileUpdate={handleProfileUpdate}
        />

        <View style={styles.formContainer}>
          {isGeneral ? (
            <>
              <ProfileForm
                onSave={handleSaveProfile}
                onProfileUpdate={handleProfileUpdate}
              />
              <View style={styles.generalActions}>
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                  activeOpacity={0.85}
                >
                  <View style={styles.logoutContent}>
                    <Ionicons
                      name="log-out-outline"
                      size={18}
                      color="#fff"
                      style={styles.logoutIcon}
                    />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <AdvancedOptions />
          )}
        </View>

        

        <BottomLinks />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    // marginTop is set dynamically in component to HEADER_HEIGHT
  },
  scrollContent: {
    paddingBottom: 30,
  },
  welcomeContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8f4f8",
    shadowColor: "#3898B3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  welcomeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  welcomeIconContainer: {
    backgroundColor: "#e8f4f8",
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
  },
  welcomeText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    marginBottom: 16,
  },
  progressIndicator: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e8f4f8",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    width: "65%",
    backgroundColor: "#3898B3",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#3898B3",
    fontWeight: "600",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#fff",
    marginTop: 10,
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 20,
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#3898B3",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#3898B3",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  skipButtonText: {
    color: "#3898B3",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 6,
  },
  skipIcon: {
    opacity: 0.8,
  },
  generalActions: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logoutButton: {
    backgroundColor: '#FF4D4F',
    width: screenWidth * 0.9,
    alignSelf: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#FF4D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfilePage;
