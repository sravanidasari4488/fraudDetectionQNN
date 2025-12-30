import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const blockTaskMaster = async (req, res) => {
    console.log("request reached here");
  const tm_id = req.body.tm_id;
  
    if (!tm_id) {
        return res.status(400).json(new ApiResponse(400, null, "Task Master ID is required"));
    }

    try {
        const { data, error } = await supabase
            .schema("onlyclick")
            .from("taskmaster")
            .update({ blocked_status: true })
            .eq("tm_id", tm_id);

        if (error) throw error;

        return res.status(200).json(new ApiResponse(200, data, "Task Master blocked successfully"));
    } catch (error) {
        return res.status(400).json(new ApiResponse(400, null, error.message));
    }
};


export const unBlockTaskMaster = async (req, res) => {
  const tm_id = req.body.tm_id;
  
    if (!tm_id) {
        return res.status(400).json(new ApiResponse(400, null, "Task Master ID is required"));
    }

    try {
        const { data, error } = await supabase
            .schema("onlyclick")
            .from("taskmaster")
            .update({ blocked_status: false })
            .eq("tm_id", tm_id);

        if (error) throw error;

        return res.status(200).json(new ApiResponse(200, data, "Task Master unblocked successfully"));
    } catch (error) {
        return res.status(400).json(new ApiResponse(400, null, error.message));
    }
};