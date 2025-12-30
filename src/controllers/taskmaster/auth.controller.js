
import supabase from "../../db/supabaseClient.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const tmauthControl = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: "onlyclicktaskmaster://",
      },
    });

    
    if (error) {
      console.log(error);
      throw error
    };

    return res.status(200).json(
        new ApiResponse(200, {message: 'Magic link sent'})
    )
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const tmhandleCallback = async (req, res) => {
  const { access_token } = req.body;

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(access_token);
    if (error) throw error;

    console.log("Auth user:", user.id, user.email);

    const { data: existingUser } = await supabase
      .schema("onlyclick")
      .from("taskmaster")
      .select("tm_id")
      .eq("tm_id", user.id)
      .single();

    console.log("Existing user:", existingUser);
    let isNewUser;

    if (!existingUser) {
      isNewUser = true;
      console.log("Creating new user...");
      const { data: newUser, error: insertError } = await supabase
        .schema("onlyclick")
        .from("taskmaster")
        .insert({
          tm_id: user.id,
          email: user.email,
        })
        .select();

      if (insertError) {
        console.log("Insert error:", insertError);
        throw insertError;
      } else {
        console.log("New user created:", newUser);
      }
    }else{
      isNewUser = false;
    }

    return res.status(200).json(
      new ApiResponse(200, {message:"User authenticated", user, isNewUser})
    );
    // return res.json({ message: "User authenticated", user, isNewUser });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

