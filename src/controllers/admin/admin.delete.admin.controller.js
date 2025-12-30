import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const adminDelete = async(req,res)=>{
    const admin_id = req.query.admin_id;
    try{
        const {error} = await supabase
        .schema("onlyclick")
        .from("admins")
        .delete()
        .eq("admin_id", admin_id)
        
        if(error) throw new ApiError(400, error.message);

        return res.status(200).json(new ApiResponse(200,null,`deleted the admin with id ${admin_id}`));
    }catch(error){
        return res.status(400).json(new ApiResponse(400, null, 'failed to delete the admin'));
    }
}