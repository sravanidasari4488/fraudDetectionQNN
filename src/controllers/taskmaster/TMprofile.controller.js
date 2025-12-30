import supabase from "../../db/supabaseClient.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const updateTMProfile = async (req, res) => {
    const { dataObj } = req.body;
    console.log(dataObj);
    if (
        !dataObj ||
        typeof dataObj !== "object" ||
        Object.keys(dataObj).length === 0
    ) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "dataObj object is required"));
    }

    const { data, error } = await supabase
        .schema("onlyclick")
        .from("taskmaster")
        .update(dataObj)
        .eq("tm_id", req.user.id);

    if (error) {
        return res.status(400).json(new ApiResponse(400, null, error.message));
    }

    return res.status(200).json(new ApiResponse(200, { updated: true, data }));
};




