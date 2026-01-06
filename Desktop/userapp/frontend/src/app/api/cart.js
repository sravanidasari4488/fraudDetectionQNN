import api from "../api/api";

export const addToCart = async (new_item) => {
  
  try {
    const { data } = await api.post("/api/v1/addtocart", { new_item });
    
    return data; 
  } catch (error) {
    return {error};
  }
};

export const removeOneFromCart = async (service_id) => {
  try {
    const { data } = await api.post("/api/v1/removefromcart", { service_id });
    return { data };
  } catch (error) {
    return { error };
  }
};

export const addOneInCart = async (service_id) => {
  try {
    const { data, error } = await api.post("/api/v1/addoneincart", { service_id });
    if (error) throw error;
    return { data };
  } catch (error) {
    return { error };
  }
};

export const removeAllFromCart = async (service_id) => {
  try {
    const { data, error } = await api.post("/api/v1/removeallfromcart", { service_id });
    if (error) throw error;
    return { data };
  } catch (error) {
    return { error };
  }
};

