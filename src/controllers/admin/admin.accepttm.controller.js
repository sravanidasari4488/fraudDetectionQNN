import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";

export const accepttm = async (req, res) => {
  // Use route param for the tm application id
  const applicationId = req.params.id;
  const { name, ph_no, aadharcard, email, address, categories, password } =
    req.body;

  if (!applicationId) {
    return res
      .status(400)
      .json(new ApiError(400, "Application id is required as route param"));
  }

  if (!name || !ph_no || !password) {
    return res
      .status(400)
      .json(new ApiError(400, "name, ph_no and password are required in body"));
  }

  const formattedAddress = {
    house_number: address?.house_number || "",
    area: address?.area || "",
    city: address?.city || "",
    pincode: address?.pincode || "",
    additional_info: address?.additional_info || "",
  };

  try {
    // Create the auth user (Supabase Admin API)
    const { data: signUpData, error: signUpError } =
      await supabase.auth.admin.createUser({
        email: `${ph_no}@taskmaster.com`,
        password,
        email_confirm: true,
      });

    if (signUpError) {
      return res.status(400).json(new ApiError(400, signUpError.message));
    }

    const authUserId = signUpData.user.id;

    // Insert into taskmaster table. 
    const { data, error } = await supabase
      .schema("onlyclick")
      .from("taskmaster")
      .insert({
        tm_id: authUserId,
        name,
        ph_no: parseInt(ph_no),
        aadharcard,
        email: email,
        address: formattedAddress,
        categories,
        verification_status: true,
        password
      })
      .select()
      .maybeSingle();
      console.log("error here: ", error);

    if (error) {
      return res.status(500).json(new ApiError(500, error.message));
    }

    // Delete the original application record using route param
    const { data: afterdata, error: afterError } = await supabase
      .schema("onlyclick")
      .from("tmapplyrequest")
      .delete()
      .eq("id", applicationId)
      .select();

    if (afterError) {
      // Log but still return success for created user — depends on desired behavior
      console.error("Failed to delete application record:", afterError);
    }

    return res.status(200).json({ taskmaster: data, deletedApplication: afterdata });
  } catch (error) {
    console.error(error);
    return res.status(500).json(new ApiError(500, error.message || "Internal error"));
  }
};