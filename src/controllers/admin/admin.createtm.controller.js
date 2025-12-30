import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";

export const createTm = async (req, res) => {
  console.log("received");

  const {
    name,
    ph_no,
    aadharcard,
    email,
    address, // object
    categories,
    username,
    password,
    verification_status,
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    // Sign up user
    const { data: signUpData, error: signUpError } =
      await supabase.auth.admin.createUser({
        email: `${ph_no}@taskmaster.com`,
        password,
        email_confirm: true,
      });

    if (signUpError) throw new ApiError(400, signUpError.message);

    const authUserId = signUpData.user.id;
    console.log("auth id", authUserId);

    // Ensure address is stored as JSONB
    const formattedAddress = {
      house_number: address?.house_number || "",
      area: address?.area || "",
      city: address?.city || "",
      pincode: address?.pincode || "",
      additional_info: address?.additional_info || "",
    };

    // Save user data
    const { data: tmData, error: insertError } = await supabase
      .schema("onlyclick")
      .from("taskmaster")
      .insert({
        tm_id: authUserId,
        name,
        ph_no,
        aadharcard,
        email,
        address: formattedAddress,
        categories,
        username,
        password,
        verification_status: verification_status ?? false, 
        blocked_status: false,
        rating: 0,
      })
      .select();

    if (insertError){
      console.log("Insert error, deleting user:", insertError);
      throw new ApiError(400, insertError.message);
    } 

    // Return both Auth user and table row
    return res.status(201).json({
      session: signUpData.session,
      user: signUpData.user,
      tm_data: tmData[0],
    });
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
};
