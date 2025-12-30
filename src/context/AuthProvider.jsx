
import * as Linking from "expo-linking";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getAddress,
  getEmail,
  getFullName,
  getPhone,
  getProfileImage,
} from "../data/getdata/getProfile";
import supabase from "../data/supabaseClient";
import {
  clearAuthStorage,
  getAuthToken,
  getIsLoggedIn,
  getIsNewUser,
  getStoredUserDetails,
  setAuthToken as setStoredAuthToken,
  setIsNewUser as setStoredIsNewUser,
  setStoredUserDetails
} from "../utils/storage";
import { useAppStates } from "./AppStates";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const { markAppOpened } = useAppStates();
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(null);
  const [error, setError] = useState("");
  const [isProcessingDeepLink, setIsProcessingDeepLink] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
     
      // First, load saved authentication state from storage
      const savedIsLoggedIn = await getIsLoggedIn();
      const savedUserDetails = await getStoredUserDetails();
      const savedAuthToken = await getAuthToken();
      const savedIsNewUser = await getIsNewUser();

      // If we have saved authentication state, set it immediately for offline support
      // Also handle case where we have user details but isLoggedIn flag is wrong
      if ((savedIsLoggedIn && savedUserDetails) || (!savedIsLoggedIn && savedUserDetails && savedUserDetails._id)) {
        setUser(savedUserDetails);
        setAuthToken(savedAuthToken);
        setIsLoggedIn(true);
        
        // Fix the storage if isLoggedIn was incorrectly saved as false
        if (!savedIsLoggedIn && savedUserDetails && savedUserDetails._id) {
          await setIsLoggedIn(true);
        }
        
        // Smart isNewUser determination for offline support
        let finalIsNewUser = savedIsNewUser;
        
        // Only change isNewUser from true to false if we have confirmed complete profile data
        // This ensures new users who haven't completed profile setup remain as new users
        const hasStoredProfile = savedUserDetails.name && savedUserDetails.phone && 
                               savedUserDetails.name.trim() !== "" && savedUserDetails.phone.trim() !== "";
        
        if (hasStoredProfile) {
          // User definitely has complete profile - they're not new
          finalIsNewUser = false;
          await setStoredIsNewUser(false);
        }

        
        setIsNewUser(finalIsNewUser);
        
        // Immediately set loading to false so user can access the app
        setIsLoading(false);
        
        return;
      }

      // No saved state - check for fresh Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();
     
      if (session?.user && !error) {
        await processUserSession(session);
      } else {
        setIsLoggedIn(false);
        setIsNewUser(null);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      
      // If we have saved data, use it even if initialization failed
      const savedIsLoggedIn = await getIsLoggedIn();
      const savedUserDetails = await getStoredUserDetails();
      const savedAuthToken = await getAuthToken();
      const savedIsNewUser = await getIsNewUser();
      
      if (savedIsLoggedIn && savedUserDetails) {
        setUser(savedUserDetails);
        setAuthToken(savedAuthToken);
        setIsLoggedIn(true);
        setIsNewUser(savedIsNewUser);
      } else {
        await clearAuthState();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Process user session and populate user data
  const processUserSession = async (session, skipIfCachedDataExists = false) => {
    try {
      const currentUser = session.user;
      const userId = currentUser.id;

      // If we're doing a background refresh and already have good cached data, 
      // don't overwrite it with potentially empty network responses
      if (skipIfCachedDataExists && user && user.name && user.phone) {
        return;
      }

      const fullName = await getFullName(userId);
      const avatar = await getProfileImage(userId);
      const email = await getEmail(userId);
      const phone = await getPhone(userId);
      const address = await getAddress(userId);

      // If all fetched fields are empty, do NOT overwrite cached data
      const isFetchedDataEmpty = !fullName && !avatar && !email && !phone && !address;
      if (isFetchedDataEmpty && user && user._id) {
        return;
      }

      // Don't update if we got empty name/phone and we already have better cached data
      if (user && user.name && user.phone && (!fullName || !phone)) {
        return;
      }

      const userData = {
        name: (fullName && fullName !== "null") ? fullName : "",
        address: (address && address !== "null") ? address : "",
        phone: (phone && phone !== "null") ? phone : "",
        email: (email && email !== "null") ? email : "",
        _id: userId,
        taskMasterId: "",
        service: "",
        profileImage: avatar,
        reviews: 0,
        ratings: 0,
        authToken: {
          token: session.access_token,
          expiryDate: "",
        },
        refreshToken: {
          token: session.refresh_token,
          expiryDate: "",
        },
      };

      // Set all authentication state together
      setUser(userData);
      setAuthToken(session.access_token || "");
      setIsLoggedIn(true);

      // Save to storage
      await setStoredUserDetails(userData);
      await setStoredAuthToken(session.access_token || "");
      await setIsLoggedIn(true);

      // If isNewUser is not already determined, determine it based on profile completeness
      const currentIsNewUser = isNewUser;
      if (currentIsNewUser === null) {
        const hasCompleteProfile = !!(fullName && phone);
        const determinedIsNewUser = !hasCompleteProfile;
        
        setIsNewUser(determinedIsNewUser);
        await setStoredIsNewUser(determinedIsNewUser);
      }

   
    } catch (error) {
     
      throw error;
    }
  };

  // Handle deep links
  const handleDeepLink = async (url) => {
    try {
      if (!url) return;

    

      // Check if this is an auth deep link
      if (url.startsWith("onlyclick://") && (url.includes('access_token') || url.includes('refresh_token'))) {
        // Set loading to true and mark deep link processing to prevent premature routing
        setIsLoading(true);
        setIsProcessingDeepLink(true);
      

        // Extract tokens from URL
        const accessTokenMatch = url.match(/access_token=([^&]+)/);
        const refreshTokenMatch = url.match(/refresh_token=([^&]+)/);

        if (accessTokenMatch && refreshTokenMatch) {
          const accessToken = accessTokenMatch[1];
          const refreshToken = refreshTokenMatch[1];

         

          // Call backend callback first to get isNewUser
          try {
            const api = (await import("../app/api/api.js")).default;
            const callbackResponse = await api.post("/api/v1/callback", {
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            const backendIsNewUser = callbackResponse.data.data.isNewUser;
            setIsNewUser(backendIsNewUser);
            // Save isNewUser to storage
            await setStoredIsNewUser(backendIsNewUser);
       
          } catch (callbackError) {
           
            setIsNewUser(false); // Default to existing user if backend fails
            await setStoredIsNewUser(false);
          }

          // Set Supabase session
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
           
            setError(error.message);
            setIsLoading(false);
            return;
          }

          if (data.session) {
           
            await processUserSession(data.session);
           
          } else {
          
          }
        } else {
          
        }

        
        setIsLoading(false);
        setIsProcessingDeepLink(false);
      } else {
       
      }
    } catch (error) {
     
      setError(error.message);
      setIsLoading(false);
      setIsProcessingDeepLink(false);
    }
  };

  // Clear authentication state
  const clearAuthState = async () => {
    setUser(null);
    setIsLoggedIn(false);
    setAuthToken("");
    setIsNewUser(null);
    setError("");
    
    // Clear all auth data from storage
    await clearAuthStorage();
  };


  // Function to refresh user details
  const refreshUserDetails = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        await processUserSession(session);
      }
    } catch (error) {
      console.warn("Failed to refresh user details:", error);
      // Don't throw error to avoid breaking the app
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Debug function to check storage
  const debugStorage = async () => {
    try {
      const savedIsLoggedIn = await getIsLoggedIn();
      const savedUserDetails = await getStoredUserDetails();
      const savedAuthToken = await getAuthToken();
      const savedIsNewUser = await getIsNewUser();

      
      return {
        savedIsLoggedIn,
        savedIsNewUser,
        savedUserDetails,
        savedAuthToken
      };
    } catch (error) {
      console.error("Storage debug error:", error);
      return null;
    }
  };

  // Set error
  const setErrorState = (errorMessage) => {
    setError(errorMessage);
  };

  useEffect(() => {
    // Initialize auth state
    initializeAuth();

    // Set up deep link handler for when app is already open
    const subscription = Linking.addEventListener('url', (event) => {
      const url = event.url;
    

      // Force immediate processing of the deep link
      if (url) {
        // Use setTimeout to ensure this runs after the current execution context
        // setTimeout(() => {
          handleDeepLink(url);
        // }, 0);
      }
    });

    // Check for initial URL (app opened via deep link)
    Linking.getInitialURL().then(url => {
      if (url) {
       
        handleDeepLink(url);
      }
    });



    return () => {
      subscription?.remove();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isLoggedIn,
      setIsLoggedIn,
      authToken,
      setAuthToken,
      refreshUserDetails,
      isLoading,
      isNewUser,
      setIsNewUser,
      error,
      setError: setErrorState,
      updateUser,
      isProcessingDeepLink,
      isConnected,
      debugStorage,
    }),
    [user, isLoggedIn, authToken, isLoading, isNewUser, error, isProcessingDeepLink, isConnected]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
