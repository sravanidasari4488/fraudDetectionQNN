import supabase from "../db/supabaseClient.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const saveUserLocation = async (req, res) => {
  const userId = req.user?.id;
  const { latitude, longitude, formatted_address: formattedAddress } = req.body;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !formattedAddress ||
    formattedAddress.trim().length === 0
  ) {
    throw new ApiError(400, "Latitude, longitude and formatted_address are required");
  }

  // Store location as JSON string in the location column: {latitude, longitude, formatted_address}
  const locationData = JSON.stringify({
    latitude,
    longitude,
    formatted_address: formattedAddress.trim(),
  });

  const { data, error } = await supabase
    .schema("onlyclick")
    .from("users")
    .update({ 
      location: locationData,
      address: formattedAddress.trim() // Also update address column for backward compatibility
    })
    .eq("user_id", userId)
    .select();

  if (error) {
    throw new ApiError(500, "Failed to save user location", error);
  }

  const userRecord = Array.isArray(data) ? data[0] : data;

  return res
    .status(200)
    .json(new ApiResponse(200, { 
      location: {
        latitude,
        longitude,
        formatted_address: formattedAddress.trim()
      },
      user: userRecord
    }));
};


