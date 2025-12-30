import supabase from "./src/db/supabaseClient.js";

const checkUser = async () => {
    try {
        const email = "codewayr232@gmail.com";
        console.log(`Checking user ${email}...`);
        const { data, error } = await supabase
            .schema("onlyclick")
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (error) {
            console.error("Error fetching user:", error);
        } else {
            console.log("User found:", data);
        }
    } catch (err) {
        console.error("Unexpected error:", err);
    }
};

checkUser();
