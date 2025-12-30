import supabase from "../../db/supabaseClient.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

export const getBlockedUser = async(req, res)=>{
    try{
        const {data, error} = await supabase
        .schema("onlyclick")
        .from("blockeduser")
        .select("email");

        if(error) throw new ApiError(400, error.message);

        return res.status(200).json(data);

    }catch(error){
        return res.status(400).json(new ApiResponse(400, null, 'failed to get the blocked user'));
    }
}