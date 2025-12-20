import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";

export const getAdmins = async(req, res)=>{
    try{
        const {data, error} = await supabase
        .schema("onlyclick")
        .from("admins")
        .select("*");

        if(error) throw new ApiError(404, error.message);

        return res.status(200).json(data);
    }catch(error){
        return res.status(404).json(new ApiError(404, error.message));
    }
}