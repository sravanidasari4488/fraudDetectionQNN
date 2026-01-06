import * as NavigationBar from "expo-navigation-bar/src/NavigationBar.android";
import { usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import Text from "../components/ui/Text";
import UpdateModal from "../components/common/UpdateModal";
import { useAppStates } from "../context/AppStates";
import { useAuth } from "../context/AuthProvider";
import { checkAppUpdate } from "../services/appVersionService";

export default function Index() {
  const { isAppOpenedFirstTime, markAppOpened } = useAppStates();
  const { 
    isLoggedIn, 
    isLoading, 
    user, 
    isNewUser,
    isProcessingDeepLink
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [latestVersion, setLatestVersion] = useState(null);
  
  const a = useCallback(async () => {
    await NavigationBar.setVisibilityAsync("hidden");
    // await NavigationBar.setBehaviorAsync("inset-swipe"); // This line causes the warning, commented out
  }, []);
  
  useEffect(() => {
    a();
  }, []);

  // Check for app updates on app launch
  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const updateInfo = await checkAppUpdate();
        if (updateInfo.needsUpdate) {
          setLatestVersion(updateInfo.latestVersion);
          setShowUpdateModal(true);
        }
      } catch (error) {
        console.warn('[Index] Failed to check app update:', error instanceof Error ? error.message : String(error));
      }
    };

    // Check for updates after a short delay to avoid blocking initial load
    const timeoutId = setTimeout(checkUpdate, 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    // Wait for app states to be loaded, but don't wait for auth loading if we already have auth state
    if (isAppOpenedFirstTime !== null) {

      // CRITICAL: Don't route anything if deep link authentication is in progress
      if (isProcessingDeepLink) {
        return;
      }

      // Don't redirect if user is already on profile-setup page
      if (pathname === '/(app)/auth/profile-setup') {
        return;
      }

      // PRIORITY 1: Handle authenticated users first (regardless of first-time status or loading state)
      if (isLoggedIn && isNewUser === true) {
        // User is logged in but is new user - needs profile setup
        // Mark app as opened since user is successfully authenticated
        if (isAppOpenedFirstTime) markAppOpened();
        router.replace("/(app)/auth/profile-setup");
        return;
      } else if (isLoggedIn && !user && !isLoading) {
        // User is logged in but user data not yet loaded and not loading - wait
        return;
      } else if (isLoggedIn && user && isNewUser === false) {
        // User is logged in and is not a new user - go to main app (trust isNewUser flag)
        // Mark app as opened since user is successfully authenticated
        if (isAppOpenedFirstTime) markAppOpened();
        router.replace("/(app)/protected/(tabs)/Home");
        return;
      } else if (isLoggedIn && user && (!user.name || !user.phone) && isNewUser === null) {
        // User logged in but profile incomplete AND we don't know if they're new - go to profile setup
        // This only happens if isNewUser hasn't been set yet (edge case)
        // Mark app as opened since user is successfully authenticated
        if (isAppOpenedFirstTime) markAppOpened();
        router.replace("/(app)/auth/profile-setup");
        return;
      } else if (isLoggedIn && user) {
        // User is logged in and has user data - go to main app (fallback)
        // Mark app as opened since user is successfully authenticated
        if (isAppOpenedFirstTime) markAppOpened();
        router.replace("/(app)/protected/(tabs)/Home");
        return;
      }

      // PRIORITY 2: Handle non-authenticated users (only if not currently loading auth)
      if (!isLoading) {
        if (isAppOpenedFirstTime) {
          // First time opening app - show onboarding
          router.replace("/intro");
        } else if (!isLoggedIn) {
          // User not logged in - go to sign in
          router.replace("/(app)/auth/sign-in");
        }
      }
    }
  }, [isAppOpenedFirstTime, isLoggedIn, isLoading, user, isNewUser, isProcessingDeepLink, router, pathname, markAppOpened]);

  // Show loading while checking app state
  return (
    <>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
      }}>
        <ActivityIndicator size="large" color="#3898b3" />
        <Text style={{ marginTop: 20, color: '#666' }}>
          {isLoading ? "Loading OnlyClick..." : "Loading..."}
        </Text>
      </View>
      <UpdateModal
        visible={showUpdateModal}
        latestVersion={latestVersion}
        onClose={() => setShowUpdateModal(false)}
      />
    </>
  );
}
