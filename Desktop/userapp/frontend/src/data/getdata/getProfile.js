import supabase from "../supabaseClient.js";

export const getFullName = async (userId) => {
  try {
    const { data, error } = await supabase
      .schema("onlyclick")
      .from("users")
      .select("full_name")
      .eq("user_id", userId)
      .single();

  

    if (error) {
      return "";
    }
    const name = data?.full_name;
    return (name && name !== "null") ? name : "";
  } catch (err) {
    return "";
  }
};

export const getProfileImage = async (userId) => {
  try {
    const { data, error } = await supabase
      .schema("onlyclick")
      .from("users")
      .select("avatar_url")
      .eq("user_id", userId)
      .single();

    if (error) {
      return "";
    }
    const avatar = data?.avatar_url;
    return (avatar && avatar !== "null") ? avatar : "";
  } catch (err) {
    return "";
  }
};

export const getEmail = async (userId) => {
  try {
    const { data, error } = await supabase
      .schema("onlyclick")
      .from("users")
      .select("email")
      .eq("user_id", userId)
      .single();

    if (error) {
      return "";
    }
    const email = data?.email;
    return (email && email !== "null") ? email : "";
  } catch (err) {
    return "";
  }
};

export const getPhone = async (userId) => {
  try {
    const { data, error } = await supabase
      .schema("onlyclick")
      .from("users")
      .select("ph_no")
      .eq("user_id", userId)
      .single();

    if (error) {
      return "";
    }
    const phone = data?.ph_no;
    return (phone && phone !== "null") ? String(phone) : "";
  } catch (err) {
    return "";
  }
};

export const getAddress = async (userId) => {
  try {
    const { data, error } = await supabase
      .schema("onlyclick")
      .from("users")
      .select("address")
      .eq("user_id", userId)
      .single();

    if (error) {
      return "";
    }
    const address = data?.address;
    return (address && address !== "null") ? address : "";
  } catch (err) {
    return "";
  }
};

