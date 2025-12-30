import supabase from "../../db/supabaseClient.js";

export const adminUnblockUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const { error } = await supabase
    .schema("onlyclick")
      .from("blockeduser")
      .delete()
      .eq("email", email);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ message: "Failed to unblock user" });
    }

    return res.status(200).json({ message: "User unblocked successfully" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
