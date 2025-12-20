import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";

export const getUsers= async(req, res)=>{
    try{
        const {data, error} = await supabase
        .schema("onlyclick")
        .from("users")
        .select("*")

        if(error) throw new ApiError(400, error.message);

        return res.status(200).json(data)
    }catch(error){
        return res.status(400).json(new ApiError(400, 'failed to get the users'));
    }
}