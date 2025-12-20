import supabase from "../db/supabaseClient.js";

async function checkAdmin(req, res, next) {
  try {
    const { data, error } = await supabase
      .schema("onlyclick")
      .from("admins")
      .select("adminemail")
      .eq("adminemail", req.user.email);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Admin not found", data });
    }

    next();
    // return res.status(200).json({data})
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}


export default checkAdmin;
