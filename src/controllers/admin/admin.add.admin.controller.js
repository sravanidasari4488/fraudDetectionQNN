import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const addAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    const { data, error } = await supabase
      .schema("onlyclick")
      .from("admins")
      .insert({ adminemail: email })
      .select()
      .single();

    if (error) throw new ApiError(400, error.message);
    return res
      .status(200)
      .json(new ApiResponse(200, data, "Admin added successfully"));
  } catch (error) {
    return res.status(400).json(new ApiResponse(400, null, error.message));
  }
};
