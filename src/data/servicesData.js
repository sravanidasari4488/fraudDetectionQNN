// Services Data - Only Click User App
// Complete service catalog with all services
import supabase from "./supabaseClient.js";

// get unique categories from services
const categoryMeta = {
  electrical: {
    icon: "flash",
    color: "#9C27B0",
    description: "Complete electrical solutions",
  },
  plumbing: {
    icon: "water",
    color: "#2196F3",
    description: "Professional plumbing services",
  },
  cleaning: {
    icon: "home",
    color: "#FF9800",
    description: "Deep cleaning and maintenance",
  },
  carpentry: {
    icon: "hammer",
    color: "#4CAF50",
    description: "Expert carpentry solutions",
  },
  ac_service: {
    icon: "snow",
    color: "#00BCD4",
    description: "AC installation and repair",
  },
  consultation: {
    icon: "clipboard",
    color: "#795548",
    description: "Expert consultation",
  },
};

// Category images mapping
export const categoryImages = {
  electrical: require("../../assets/images/electrical.png"),
  plumbing: require("../../assets/images/plumbing.png"),
  carpentry: require("../../assets/images/carpentry.png"),
  cleaning: require("../../assets/images/cleaning.png"),
  ac: require("../../assets/images/ACservices.png"),
  consultation: require("../../assets/images/painting.png"),
  all: require("../../assets/images/allServices.png"),
};

// Merge metadata with categories fetched from DB
export const allCategories = async () => {
  const { data, error } = await supabase
    .schema("onlyclick")
    .from("services")
    .select("category");

  if (error) {
    return [];
  }

  const uniqueCategories = [...new Set(data.map((item) => item.category))];

  return uniqueCategories.map((cat) => ({
    id: cat.toLowerCase().replace(/\s+/g, "_"),
    name: cat,
    ...categoryMeta[cat.toLowerCase().replace(/\s+/g, "_")],
  }));
};

export const allServices = async () => {
  const { data, error } = await supabase
    .schema("onlyclick")
    .from("services")
    .select("*");

  if (error) {
    return [];
  }
  return data;
};

export const getServicesByCategory = async (categoryId) => {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("category", categoryId);

  if (error) {
    return [];
  }
  return data;
};

// get service by ID
export const getServiceById = async (serviceId) => {
  const { data, error } = await supabase
    .schema("onlyclick")
    .from("services")
    .select("*")
    .eq("service_id", serviceId)
    .single();

  if (error) {
    return null;
  }
  return data;
};

// search services
export const searchServices = async (query) => {
  const { data, error } = await supabase
    .schema("onlyclick")
    .from("services")
    .select("*")
    .or(
      `title.ilike.%${query}%,description.ilike.%${query}%,sub_category.ilike.%${query}%`
    );

  if (error) {
    return [];
  }
  return data;
};

export const getpopularServices = async () => {
  const { data, error } = await supabase
    .schema("onlyclick")
    .from("services")
    .select("*")
    .order("count", { ascending: false }) // sort by count in descending order
    .limit(2);

  if (error) {
    return [];
  }

  const formatdata = (element) => {
    return {
      id: element.id,
      title: element.title,
      reviews: "",
      rating: element.ratings,
      price: element.price,
      image: element.image_url, 
      discount: element.discount,
    };
  };

  
  
  const arr = data.map(formatdata);
  return { arr, error: null };
};

export default {
  // serviceCategories,
  allCategories,
  allServices,
  getServicesByCategory,
  getServiceById,
  searchServices,
  getpopularServices,
};
