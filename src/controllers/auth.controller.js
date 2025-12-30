import supabase from "../db/supabaseClient.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const authControl = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: "onlyclick://login-callback",
      },
    });


    if (error) throw error;

    return res.json({
      message: "Magic link sent to your email",
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const handleCallback = async (req, res) => {
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
      .from("users")
      .select("user_id, full_name, ph_no, address")
      .eq("user_id", user.id)
      .single();



    console.log("Existing user:", existingUser);
    let isNewUser;

    if (!existingUser) {
      // User doesn't exist in database, create new entry
      isNewUser = true;
      console.log("Creating new user...");
      const { data: newUser, error: insertError } = await supabase
        .schema("onlyclick")
        .from("users")
        .insert({
          user_id: user.id,
          email: user.email,
        })
        .select();

      if (insertError) {
        console.log("Insert error:", insertError);
        throw insertError;
      } else {
        console.log("New user created:", newUser);
      }
    } else {
      // User exists, check if profile is complete
      // Profile is incomplete if full_name, ph_no, or address is null
      const hasCompleteProfile = existingUser.full_name && existingUser.ph_no && existingUser.address;
      isNewUser = !hasCompleteProfile;

      if (isNewUser) {
        console.log("User exists but profile incomplete, marking as new user");
      } else {
        console.log("User exists with complete profile");
      }
    }

    return res.status(200).json(
      new ApiResponse(200, { message: "User authenticated", user, isNewUser })
    );
    // return res.json({ message: "User authenticated", user, isNewUser });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};


export const testLogin = async (req, res) => {
  // Security check: Only allow in development
  // if (process.env.NODE_ENV !== "development") {
  //   return res.status(403).json({ error: "Forbidden in production" });
  // }

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    // 1. Generate Magic Link (to get the OTP)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
    });

    if (linkError) throw linkError;

    const emailOtp = linkData.properties?.email_otp;
    if (!emailOtp) throw new Error("Could not generate OTP");

    // 2. Verify OTP to get session
    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
      email,
      token: emailOtp,
      type: 'email'
    });

    if (sessionError) throw sessionError;

    const user = sessionData.user;

    // 3. Sync with onlyclick.users table (same logic as handleCallback)
    const { data: existingUser } = await supabase
      .schema("onlyclick")
      .from("users")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    let isNewUser = false;

    if (!existingUser) {
      isNewUser = true;
      const { error: insertError } = await supabase
        .schema("onlyclick")
        .from("users")
        .insert({
          user_id: user.id,
          email: user.email,
          full_name: 'Test User',
          ph_no: 9876543210,
        });

      if (insertError) throw insertError;
    }

    return res.status(200).json(
      new ApiResponse(200, {
        message: "Test login successful",
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        user,
        isNewUser
      })
    );

  } catch (err) {
    console.error("Test login error:", err);
    return res.status(400).json({ error: err.message });
  }
};
