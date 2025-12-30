import supabase from "../../db/supabaseClient.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
// Get all general data
const getGeneralData = async (req, res) => {
  try {
    const { data, error } = await supabase
      .schema("onlyclick")
      .from("general_data")
      .select("*")
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching general data:", error);
      throw new ApiError(500, "Failed to fetch general data");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, data, "General data fetched successfully"));

  } catch (error) {
    console.error("Get general data error:", error);
    return res
      .status(error.statusCode || 500)
      .json({
        statusCode: error.statusCode || 500,
        message: error.message || "Failed to fetch general data",
        success: false
      });
  }
};

// Update general data (create if doesn't exist)
const updateGeneralData = async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key) {
      throw new ApiError(400, "Key is required");
    }

    if (value === undefined || value === null) {
      throw new ApiError(400, "Value is required");
    }

    // First check if the key already exists
    const { data: existingData, error: selectError } = await supabase
      .schema("onlyclick")
      .from("general_data")
      .select("*")
      .eq("key", key)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error("Error checking existing data:", selectError);
      throw new ApiError(500, "Failed to check existing data");
    }

    let result;

    if (existingData) {
      // Update existing record
      const { data, error } = await supabase
        .schema("onlyclick")
        .from("general_data")
        .update({ value: value.toString() })
        .eq("key", key)
        .select()
        .single();

      if (error) {
        console.error("Error updating general data:", error);
        throw new ApiError(500, "Failed to update general data");
      }

      result = data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .schema("onlyclick")
        .from("general_data")
        .insert({ key, value: value.toString() })
        .select()
        .single();

      if (error) {
        console.error("Error creating general data:", error);
        throw new ApiError(500, "Failed to create general data");
      }

      result = data;
    }

    return res
      .status(200)
      .json(new ApiResponse(200, result, `${key} updated successfully`));

  } catch (error) {
    console.error("Update general data error:", error);
    return res
      .status(error.statusCode || 500)
      .json({
        statusCode: error.statusCode || 500,
        message: error.message || "Failed to update general data",
        success: false
      });
  }
};

// Get specific general data by key
const getGeneralDataByKey = async (req, res) => {
  try {
    const { key } = req.params;

    if (!key) {
      throw new ApiError(400, "Key is required");
    }

    const { data, error } = await supabase
      .schema("onlyclick")
      .from("general_data")
      .select("*")
      .eq("key", key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ApiError(404, `No data found for key: ${key}`);
      }
      console.error("Error fetching general data by key:", error);
      throw new ApiError(500, "Failed to fetch general data");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, data, "General data fetched successfully"));

  } catch (error) {
    console.error("Get general data by key error:", error);
    return res
      .status(error.statusCode || 500)
      .json({
        statusCode: error.statusCode || 500,
        message: error.message || "Failed to fetch general data",
        success: false
      });
  }
};

// Delete general data by key
const deleteGeneralData = async (req, res) => {
  try {
    const { key } = req.params;

    if (!key) {
      throw new ApiError(400, "Key is required");
    }

    const { data, error } = await supabase
      .schema("onlyclick")
      .from("general_data")
      .delete()
      .eq("key", key)
      .select();

    if (error) {
      console.error("Error deleting general data:", error);
      throw new ApiError(500, "Failed to delete general data");
    }

    if (!data || data.length === 0) {
      throw new ApiError(404, `No data found for key: ${key}`);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, data[0], "General data deleted successfully"));

  } catch (error) {
    console.error("Delete general data error:", error);
    return res
      .status(error.statusCode || 500)
      .json({
        statusCode: error.statusCode || 500,
        message: error.message || "Failed to delete general data",
        success: false
      });
  }
};

// Create coupon (creates both NAME_COUPON and NAME_DISCOUNT_PERCENT entries)
const createCoupon = async (req, res) => {
  try {
    const { couponName, discountPercent } = req.body;

    if (!couponName || !discountPercent) {
      throw new ApiError(400, "Coupon name and discount percentage are required");
    }

    const normalizedName = couponName.toUpperCase().trim();
    const couponKey = `${normalizedName}_COUPON`;
    const discountKey = `${normalizedName}_DISCOUNT_PERCENT`;

    // Check if coupon already exists
    const { data: existingCoupon, error: checkError } = await supabase
      .schema("onlyclick")
      .from("general_data")
      .select("*")
      .eq("key", couponKey)
      .single();

    if (existingCoupon) {
      throw new ApiError(400, "Coupon with this name already exists");
    }

    // Create both entries
    const { data: couponData, error: couponError } = await supabase
      .schema("onlyclick")
      .from("general_data")
      .insert([
        { key: couponKey, value: normalizedName },
        { key: discountKey, value: discountPercent.toString() }
      ])
      .select();

    if (couponError) {
      console.error("Error creating coupon:", couponError);
      throw new ApiError(500, "Failed to create coupon");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, couponData, "Coupon created successfully"));

  } catch (error) {
    console.error("Create coupon error:", error);
    return res
      .status(error.statusCode || 500)
      .json({
        statusCode: error.statusCode || 500,
        message: error.message || "Failed to create coupon",
        success: false
      });
  }
};

// Delete coupon (deletes both NAME_COUPON and NAME_DISCOUNT_PERCENT entries)
const deleteCoupon = async (req, res) => {
  try {
    const { couponName } = req.params;

    if (!couponName) {
      throw new ApiError(400, "Coupon name is required");
    }

    const normalizedName = couponName.toUpperCase().trim();
    const couponKey = `${normalizedName}_COUPON`;
    const discountKey = `${normalizedName}_DISCOUNT_PERCENT`;

    // Delete both entries
    const { data, error } = await supabase
      .schema("onlyclick")
      .from("general_data")
      .delete()
      .in("key", [couponKey, discountKey])
      .select();

    if (error) {
      console.error("Error deleting coupon:", error);
      throw new ApiError(500, "Failed to delete coupon");
    }

    if (!data || data.length === 0) {
      throw new ApiError(404, `No coupon found with name: ${couponName}`);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, data, "Coupon deleted successfully"));

  } catch (error) {
    console.error("Delete coupon error:", error);
    return res
      .status(error.statusCode || 500)
      .json({
        statusCode: error.statusCode || 500,
        message: error.message || "Failed to delete coupon",
        success: false
      });
  }
};


export {
  getGeneralData,
  updateGeneralData,
  getGeneralDataByKey,
  deleteGeneralData,
  createCoupon,
  deleteCoupon,
};