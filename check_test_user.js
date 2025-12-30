import supabase from "./src/db/supabaseClient.js";

const checkUsers = async () => {
    try {
        console.log("Checking users in onlyclick.users...");
        const { data, error } = await supabase
            .schema("onlyclick")
            .from("users")
            .select("*")
            .limit(5);

        if (error) {
            console.error("Error fetching users:", error);
        } else {
            console.log("Users found:", data);
        }
    } catch (err) {
        console.error("Unexpected error:", err);
    }
};

checkUsers();
