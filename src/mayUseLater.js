// app.post("/send-otp", async (req, res) => {
//   const { phone } = req.body;

//   const { data, error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` });

//   if (error) return res.status(400).json({ error: error.message });
//   res.json({ message: "OTP sent successfully" });
// });

// app.post("/verify-otp", async (req, res) => {
//   const { phone, token } = req.body;

//   const { data, error } = await supabase.auth.verifyOtp({
//     phone: `+91${phone}`,
//     token,
//     type: "sms",
//   });

//   if (error) return res.status(400).json({ error: error.message });

//   res.json({
//     message: "OTP verified successfully",
//     user: data.user,
//     session: data.session, //has access and refresh token
//   });
// });
