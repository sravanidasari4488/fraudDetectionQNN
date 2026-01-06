import supabase from "../../data/supabaseClient.js";
import { clearAllAppStorage } from "../../utils/storage.js";
import api from "./api.js";

// Function to clear all app state and user data
const clearAllAppState = async () => {
  try {
    // Clear all AsyncStorage data using utility function
    await clearAllAppStorage();

    // Sign out from Supabase
    await supabase.auth.signOut();

  } catch (error) {
    console.error("❌ Error clearing app state:", error);
    // Even if clearing fails, we should continue with the deletion
  }
};

export const deleteUser = async () => {
  try {
    // Get current user ID
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      throw new Error("No authenticated user found");
    }

    // Send user_id as query parameter instead of body
    const response = await api.delete(
      `/api/v1/delete?user_id=${session.user.id}`
    );

    // If deletion is successful, clear all app state and user data
    await clearAllAppState();

    return response.data;
  } catch (error) {


    throw error;
  }
};
