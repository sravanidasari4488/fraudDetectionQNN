import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "fs";
import path from "path";

export const profilePicUpdate = async (req, res) => {
  try {
    const { tm_id } = req.body; // Get TaskMaster ID from request body
    const image = req.file;

    if (!tm_id) {
      return res
        .status(400)
        .json(new ApiError(400, "TaskMaster ID is required"));
    }

    if (!image) {
      return res.status(400).json(new ApiError(400, "Image file is required"));
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(image.path);

    // Clean up temp file
    const filePath = path.resolve(image.path);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.log("Failed to delete temp file: ", err);
      });
    }

    // Update TaskMaster profile picture in database
    const { data, error } = await supabase
      .schema("onlyclick")
      .from("taskmaster")
      .update({ tm_profilepic: result.secure_url }) // Use tm_profilepic field
      .eq("tm_id", tm_id)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json(new ApiError(500, error.message));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { tm_profilepic: result.secure_url },
          "Profile picture updated successfully"
        )
      );
  } catch (error) {
    console.error("profilePicUpdate error:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};
