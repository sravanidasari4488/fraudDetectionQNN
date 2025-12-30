import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";

export const getTaskmasters = async(req,res) =>{

    try{

        const { data: tmData, error: tmError } = await supabase
          .schema("onlyclick")
          .from("taskmaster")
          .select(

            "tm_id,id, name, ph_no, email, address, categories, wallet, withdrawn, created_at, password, blocked_status"

          );

        if (tmError) throw new ApiError(500, tmError.message);

        return res.status(200).json(tmData);
    }catch(error){
        return res.status(404).json(new ApiError(404, error.message));
    }
}