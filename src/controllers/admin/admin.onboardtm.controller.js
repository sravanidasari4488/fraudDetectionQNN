import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";

export const onboardTM = async(req,res) =>{
    const { name, ph_no, email, address, categories, aadharcard } = req.body;

     const formattedAddress = {
       house_number: address?.house_number || "",
       area: address?.area || "",
       city: address?.city || "",
       pincode: address?.pincode || "",
       additional_info: address?.additional_info || "",
     };

    try{
        const { data, error } = await supabase
          .schema("onlyclick")
          .from("tmapplyrequest")
          .insert({
            name,
            ph_no: parseInt(ph_no),
            email,
            address: formattedAddress,
            categories,
            aadharcard,
          })
          .select();
    
          console.log("error", error);
        if(error) return res.status(500).json(new ApiError(500, error.message));
        return res.status(200).json(data);
    }catch(error){
        return res.status(500).json(new ApiError(500, error.message));
    }
}