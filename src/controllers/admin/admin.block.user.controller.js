import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const adminBlockUser = async(req, res) =>{
    console.log("admin block user");
    const {email} = req.body;
    if (!email) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email is required"));
    }
    try{
        const {data, error}= await supabase
        .schema("onlyclick")
        .from("blockeduser")
        .insert({
            email
        })
        .select();

        if(error) throw new ApiError(400, "Error blocking the user ");

        return res.status(200).json(new ApiResponse(200, null, `User with email: ${email} blocked successfully`));
    }catch(error){
        return res.status(400).json(new ApiResponse(400, null, 'failed to block the user'));
    }
}