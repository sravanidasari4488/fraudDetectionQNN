import supabase from "../../db/supabaseClient.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import fs from 'fs';
import path from "path";
import cloudinary from "../../config/cloudinary.js";

export const adminEditServiceImage = async(req,res)=>{
    const image = req.file;
    try {
      const result = await cloudinary.uploader.upload(image.path);
      const filePath = path.resolve(image.path);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.log("Failed to delete temp file: ", err);
        });
      }

      const { data, error } = await supabase
        .schema("onlyclick")
        .from("services")
        .update({
          image_url: result.secure_url,
        })
        .eq("service_id", req.params.id)
        .select();
      if (error)
        return res
          .status(500)
          .json(
            new ApiResponse(false, "Failed to update service image", error)
          );

      return res.status(200).json(
        new ApiResponse(200, {
          message: "image updates",
          data,
        })
      );
    } catch (error) {
      console.log("Error: ", error);
      return res
        .status(500)
        .json(new ApiResponse(500, null, "Failed to edit the image of the service"));
    }
}