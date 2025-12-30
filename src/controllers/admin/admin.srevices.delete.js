import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const servicesDelete = async(req, res) =>{
    const service_id = req.query.service_id;
    try{
        const{error} = await supabase
        .schema("onlyclick")
        .from("services")
        .delete()
        .eq("service_id", service_id)

        if(error) throw new ApiError(400, error.message);

        return res.status(200).json(new ApiResponse(200,null,`deleted the service with id ${service_id}`));
    }catch(error){
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              null,
              `failed to delete`
            )
          );
    }
}