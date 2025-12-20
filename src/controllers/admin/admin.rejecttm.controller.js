import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";

export const rejecttm = async(req,res)=>{
    const { id } = req.params;

    try{
        const {data, error} = await supabase
          .schema("onlyclick")
          .from("tmapplyrequest")
          .delete()
          .eq("id", id)
          .select();

        if(error) return res.status(500).json(new ApiError(500, error.message));
        return res.status(200).json(data);

    }catch(error){
        return res.status(500).json(new ApiError(500, error.message));
    }
}