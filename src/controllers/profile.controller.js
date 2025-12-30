import supabase from "../db/supabaseClient.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const updateProfile = async (req, res) => {
  const { full_name, ph_no, address } = req.body;
  const userId = req.user.id; // From protectedMiddleware

  try {
    // Validate required fields (address is optional - it's updated via location endpoint)
    if (!full_name || !ph_no) {
      return res.status(400).json({
        error: "Missing required fields: full_name and ph_no are required"
      });
    }

    // Validate phone number (10 digits)
    const phoneStr = ph_no.toString();
    if (!/^\d{10}$/.test(phoneStr)) {
      return res.status(400).json({
        error: "Phone number must be exactly 10 digits"
      });
    }

    // Build update object - only include fields that are provided
    const updateData = {
      full_name,
      ph_no: parseInt(ph_no),
    };

    // Only update address if it's provided
    if (address) {
      updateData.address = address;
    }

    // Update user profile in onlyclick.users table
    const { data, error } = await supabase
      .schema("onlyclick")
      .from("users")
      .update(updateData)
      .eq("user_id", userId)
      .select();

    if (error) {
      console.error("Profile update error:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    return res.status(200).json(
      new ApiResponse(200, {
        message: "Profile updated successfully",
        updated: true,
        user: data[0]
      })
    );
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ error: err.message });
  }
};
