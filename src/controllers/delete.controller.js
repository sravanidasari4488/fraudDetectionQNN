import supabase from "../db/supabaseClient.js";

export const deleteUser = async (req, res) => {
  const user_id = req.query.user_id;

  try {
    const { error } = await supabase.auth.admin.deleteUser(user_id);
    console.log("deleted ig")
    if (error) {
      console.error("Delete user error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: `User ${user_id} deleted from Auth` });
  } catch (err) {
    console.error("Unexpected error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};