import supabase from "../db/supabaseClient.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";

export const createCustomPost = async (req, res) => {
  const { description, location } = req.body;
  const image = req.file;
  const userId = req.user.id;

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(image.path);

    // Delete local file safely
    const filePath = path.resolve(image.path);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
      });
    }

    // Save in Supabase
    const { data, error } = await supabase
      .schema("onlyclick")
      .from("custompost")
      .insert({
        user_id: userId,
        description,
        location,
        image_url: result.secure_url,
      });

    if (error) {
      return res.status(400).json(new ApiResponse(400, null, error.message));
    }

    return res.status(200).json(
      new ApiResponse(200, {
        message: "Post created",
        data,
      })
    );
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json(new ApiResponse(500, null, "Upload failed"));
  }
};
