import supabase from "./src/db/supabaseClient.js";

const fixUsers = async () => {
    try {
        console.log("Fixing users with null names...");

        // Update users where full_name is null
        const { data, error } = await supabase
            .schema("onlyclick")
            .from("users")
            .update({
                full_name: 'Test User',
                ph_no: 9876543210
            })
            .is("full_name", null)
            .select();

        if (error) {
            console.error("Error updating users:", error);
        } else {
            console.log(`Updated ${data.length} users.`);
            console.log("Updated users:", data);
        }
    } catch (err) {
        console.error("Unexpected error:", err);
    }
};

fixUsers();
