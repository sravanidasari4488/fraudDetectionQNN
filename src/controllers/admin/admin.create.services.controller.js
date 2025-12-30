import supabase from "../../db/supabaseClient.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import cloudinary from "../../config/cloudinary.js";
import fs from 'fs';
import path from "path";

export const adminCreateServices = async(req, res)=>{
    const {category, price, sub_category, original_price, title, discount, description, ratings, duration, count, service_fee_percent, total_tax} = req.body;
    const image = req.file;
    try{
        const result = await cloudinary.uploader.upload(image.path);
        const filePath = path.resolve(image.path);
        if(fs.existsSync(filePath)){
            fs.unlink(filePath, (err)=>{
                if(err) console.log("Failed to delete temp file: ", err);
            });
        }

        const { data, error } = await supabase
          .schema("onlyclick")
          .from("services")
          .insert({
            category: category.toUpperCase(),
            price,
            sub_category,
            original_price,
            title,
            discount,
            description,
            ratings,
            duration,
            count,
            service_fee_percent,
            total_tax,
            image_url: result.secure_url,
          })
          .select();
        if(error) return res.status(500).json(new ApiResponse(false, "Failed to create service", error));

        return res.status(200).json(new ApiResponse(200, {
            message: "Service created successfully",
            data,
        }));
    }catch(error){
        console.log("Error: ", error);
        return res.status(500).json(new ApiResponse(500, null, "Failed to create service"));
    }
}