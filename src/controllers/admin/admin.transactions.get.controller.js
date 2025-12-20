import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";

export const get_tm_share = async(req,res) =>{
    const service_id = req.query.service_id;
    try{
        const { data: tm_shareData, error: tm_shareError } = await supabase
          .schema("onlyclick")
          .from("bookings")
          .select(
            "tm_share, payment_method, status, user_id, time_slot, service_name, tm_name, tm_contact, count, service_price, user_name"
          )
          .eq("service_id", service_id);

        if(tm_shareError) throw new ApiError(404, error.message);

        return res.status(200).json(tm_shareData);
    }catch(error){
        return res.status(404).json(new ApiError(404, error.message));
    }
}

export const get_company_share = async(req, res) =>{
    const tm_id = req.query.tm_id;
    try{
        const { data: comapany_shareData, error: company_shareError } =
          await supabase
            .schema("onlyclick")
            .from("bookings")
            .select(
              "company_share, payment_method, status, user_id, time_slot, service_name, tm_name, tm_contact, count, service_price, user_name"
            )
            .eq("tm_id", tm_id);

        if(company_shareError) throw new ApiError(404, error.message);

        return res.status(200).json(comapany_shareData);
    }catch(error){
        return res.status(404).json(new ApiError(404, error.message));
    }
}

export const get_wallet = async(req, res) =>{
    const tm_id = req.query.tm_id;
    try{
        const {data: walletData, error: walletError} = await supabase
        .schema("onlyclick")
        .from("taskmaster")
        .select("wallet, name, ph_no, email, address, categories")
        .eq("tm_id", tm_id)
        .maybeSingle();

        if(walletError) throw new ApiError(404, error.message);

        return res.status(200).json(walletData);

    }catch(error){
        return res.status(404).json(new ApiError(404, error.message));
    }
}

export const get_total_earned = async(req,res) =>{
    const tm_id = req.query.tm_id;
    try{

        const { data: total_earnedData, error: total_earnedError } =
          await supabase
            .schema("onlyclick")
            .from("taskmaster")
            .select("total_earned, name, ph_no, email, address, categories")
            .eq("tm_id", tm_id)
            .maybeSingle();

        if(total_earnedError) throw new ApiError(404, error.message);

        return res.status(200).json(total_earnedData);

    }catch(error){
        return res.status(404).json(new ApiError(404, error.message));
    }
}

export const get_withdrawn = async(req, res) =>{
    const tm_id = req.query.tm_id;
    try{
        const { data: withdrawnData, error: withdrawnError } = await supabase
          .schema("onlyclick")
          .from("taskmaster")
          .select("withdrawn, name, ph_no, email, address, categories")
          .eq("tm_id", tm_id)
          .maybeSingle();

        if(withdrawnError) throw new ApiError(404, error.message);

        return res.status(200).json(withdrawnData);
    }catch(error){
        return res.status(404).json(new ApiError(404, error.message));
    }
}