import supabase from "../db/supabaseClient.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import cloudinary from "../config/cloudinary.js";
import fs from 'fs';

export const avatar = async (req, res) => {
  const image = req.file;
  const userId = req.user.id;

  console.log("Image:", image);
  console.log("User ID:", userId);

  if (!image) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "No image provided"));
  }

  try {
    const result = await cloudinary.uploader.upload(image.path);
    fs.unlinkSync(image.path);

    const { data, error } = await supabase
      .schema("onlyclick")
      .from("users")
      .update({ avatar_url: result.secure_url }) 
      .eq("user_id", userId);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json(new ApiResponse(400, null, error.message));
    }

    return res.status(200).json(
      new ApiResponse(200, {
        message: "Avatar updated",
        avatar_url: result.secure_url,
      })
    );
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};

export const deleteAvatar = async (req, res) => {
  const userId = req.user.id;

  try {
    const { data: userData, error: fetchError } = await supabase
      .schema("onlyclick")
      .from("users")
      .select("avatar_url")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, fetchError.message));
    }

    // Delete from Cloudinary if avatar exists
    if (userData?.avatar_url) {
      const publicId = userData.avatar_url.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Remove avatar URL from database
    const { error } = await supabase
      .schema("onlyclick")
      .from("users")
      .update({ avatar_url: null })
      .eq("user_id", userId);

    if (error) {
      return res.status(400).json(new ApiResponse(400, null, error.message));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { message: "Avatar deleted" }));
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};
