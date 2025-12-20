import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";

export const get_tmapplyrequest = async(req, res) =>{
    try{
        const { data, error } = await supabase
          .schema("onlyclick")
          .from("tmapplyrequest")
          .select("name, ph_no, email, aadharcard ,address, categories, id");
        if(error) return res.status(500).json(new ApiError(500, error.message));
        return res.status(200).json(data);

    }catch(error){
        return res.status(500).json(new ApiError(500, error.message));
    }
}