import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";

export const get_transactions_tm = async(req, res) =>{
    const tm_id = req.query.tm_id;
    try{
        const { data, error } = await supabase
          .schema("onlyclick")
          .from("transactions_tm")
          .select("tm_id, created_at, type, direction, remarks, amount, id, wallet_balance, previous_wallet_balance, booking_id")
          .eq("tm_id", tm_id)
          .order("created_at", { ascending: false });

        if(error) throw new ApiError(404, error.message);

        return res.status(200).json(data);
    }catch(error){
        return res.status(404).json(new ApiError(404, error.message));
    }
}