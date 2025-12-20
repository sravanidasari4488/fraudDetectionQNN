import supabase from "../../db/supabaseClient.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import fs from "fs";
import path from "path";
import cloudinary from "../../config/cloudinary.js";

// Add a banner (expects file in req.file and optional title/subtitle in body)
export const addBanner = async (req, res) => {
  const image = req.file;
  const { title, subtitle } = req.body;

  if (!image) {
    return res.status(400).json(new ApiResponse(false, "Image file is required"));
  }

  try {
    const result = await cloudinary.uploader.upload(image.path);

    // Remove temporary file
    const filePath = path.resolve(image.path);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.log("Failed to delete temp file: ", err);
      });
    }

    const { data, error } = await supabase
      .schema("onlyclick")
      .from("userapp_banners")
      .insert({
        image: result.secure_url,
        title: title || null,
        subtitle: subtitle || null,
      })
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json(new ApiResponse(false, "Failed to insert banner", error));
    }

    return res.status(201).json(new ApiResponse(true, { banner: data }, "Banner created"));
  } catch (error) {
    console.error("addBanner error:", error);
    return res.status(500).json(new ApiResponse(false, null, "Failed to add banner"));
  }
};

// Delete a banner by id
export const deleteBanner = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json(new ApiResponse(false, "Banner id is required"));
  }

  try {
    const { data, error } = await supabase
      .schema("onlyclick")
      .from("userapp_banners")
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json(new ApiResponse(false, "Failed to delete banner", error));
    }

    return res.status(200).json(new ApiResponse(true, { deleted: data }, "Banner deleted"));
  } catch (error) {
    console.error("deleteBanner error:", error);
    return res.status(500).json(new ApiResponse(false, null, "Failed to delete banner"));
  }
};

// Get all banners
export const getBanners = async (req, res) => {
  try {
    const { data, error } = await supabase
      .schema("onlyclick")
      .from("userapp_banners")
      .select("id, image, title, subtitle, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json(new ApiResponse(false, null, "Failed to fetch banners"));
    }

    return res.status(200).json(new ApiResponse(true, { banners: data }, "Banners fetched"));
  } catch (error) {
    console.error("getBanners error:", error);
    return res.status(500).json(new ApiResponse(false, null, "Failed to fetch banners"));
  }
};
