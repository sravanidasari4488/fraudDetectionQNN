import { ApiResponse } from "../../utils/ApiResponse.js";
import supabase from "../../db/supabaseClient.js";

export const updateService = async (req, res) => {
  const { service_id, updates } = req.body;

  if (!service_id) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "service_id is required"));
  }

  if (
    !updates ||
    typeof updates !== "object" ||
    Object.keys(updates).length === 0
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Updates object is required"));
  }

  try {
    const { error, data } = await supabase
      .schema("onlyclick")
      .from("services")
      .update(updates)
      .eq("service_id", service_id)
      .select();

    if (error) {
      return res.status(400).json(new ApiResponse(400, null, error.message));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, data, "Service updated successfully"));
  } catch (error) {
    return res.status(400).json(new ApiResponse(400, null, error.message));
  }
};
