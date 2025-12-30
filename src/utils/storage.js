import AsyncStorage from "@react-native-async-storage/async-storage";
export const getTheme = async () => {
  const theme = await AsyncStorage.getItem("theme");
  return theme;
};

export const setStoredTheme = async (theme) => {
  await AsyncStorage.setItem("theme", theme);
};

export const getAppFirstOpenState = async () => {
  const appFirstOpenState = await AsyncStorage.getItem("appFirstOpenState");
  return appFirstOpenState;
};

export const setAppFirstOpenState = async () => {
  await AsyncStorage.setItem("appFirstOpenState", true);
};

export const getUserDetails = async () => {
  const userDetails = await AsyncStorage.getItem("userDetails");
  return userDetails;
};
export const setUserDetails = async (userDetails) => {
  await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));
};

export const getCartDeatails = async () => {
  const cartItems = await AsyncStorage.getItem("cartItems");
  return cartItems ? JSON.parse(cartItems) : [];
};

export const setCartDeatails = async (cartItems) => {
  await AsyncStorage.setItem("cartItems", JSON.stringify(cartItems));
};

export const appOpenedFirstTime = async () => {
  const appOpenedFirstTime = await AsyncStorage.getItem("appOpenedFirstTime");
  return appOpenedFirstTime;
};

export const setAppOpenedFirstTime = async () => {
  await AsyncStorage.setItem("appOpenedFirstTime", true);
};

// Authentication storage utilities
export const getIsLoggedIn = async () => {
  const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
  return isLoggedIn === "true";
};

export const setIsLoggedIn = async (isLoggedIn) => {
  await AsyncStorage.setItem("isLoggedIn", isLoggedIn.toString());
};

export const getIsNewUser = async () => {
  const isNewUser = await AsyncStorage.getItem("isNewUser");
  return isNewUser === "true" ? true : isNewUser === "false" ? false : null;
};

export const setIsNewUser = async (isNewUser) => {
  await AsyncStorage.setItem("isNewUser", isNewUser.toString());
};

export const getAuthToken = async () => {
  const authToken = await AsyncStorage.getItem("authToken");
  return authToken || "";
};

export const setAuthToken = async (authToken) => {
  await AsyncStorage.setItem("authToken", authToken);
};

export const getStoredUserDetails = async () => {
  const userDetails = await AsyncStorage.getItem("storedUserDetails");
  return userDetails ? JSON.parse(userDetails) : null;
};

export const setStoredUserDetails = async (userDetails) => {
  await AsyncStorage.setItem("storedUserDetails", JSON.stringify(userDetails));
};

export const clearAuthStorage = async () => {
  await AsyncStorage.removeItem("isLoggedIn");
  await AsyncStorage.removeItem("isNewUser");
  await AsyncStorage.removeItem("authToken");
  await AsyncStorage.removeItem("storedUserDetails");
};

// Clear all app state and user data (used during account deletion)
export const clearAllAppStorage = async () => {
  try {
    const keys = [
      // Authentication data
      "isLoggedIn",
      "isNewUser", 
      "authToken",
      "storedUserDetails",
      "userDetails",
      
      // App states
      "profileCompleted", 
      "selectedLocation",
      "selectedLocationObject",
      "selectedMobileNumber",
      
      // Cart and other user-specific data
      "cartItems",
      
      // Any cached data that might contain user info
      "popularServices",
      "userBookings", 
      "testimonials",
      "allServices",
      "example_bookings"
      
      // Note: We intentionally keep "theme" as users might want to retain their theme preference
    ];

    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error("❌ Error clearing app storage:", error);
    throw error;
  }
};
