import supabase from "../supabaseClient";

export default async function gettestimonials() {
    const { data, error } = await supabase
        .schema("onlyclick")
        .from("testimonials")
        .select("*") // <-- required
        .eq("allowed", true);

    if (error) {
        return { arr: [], error };
    }

    if (!data) {
        return { arr: [], error: null };
    }

    const formatdata = (element) => {

        return {
            id: element.id,
            name: element.customer_name,
            comment: element.message,
            avatar: element.customer_avatar,
        }
    };

    const arr = data.map(formatdata);
    return { arr, error: null };
}
