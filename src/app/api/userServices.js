import api from "./api";

export const updateProfile = async (updates) => {
  try {
    const { data } = await api.post("/api/v1/update", { updates });
    
    return data; 
  } catch (error) {

    throw error;
  }
};

export const uploadAvatar = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "avatar.jpg",
    });

    const { data } = await api.post("/api/v1/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  } catch (error) {
    return { error };
  }
};

export const deleteAvatar = async () => {
  try {
    const { data } = await api.delete("/api/v1/avatar");
    return data;
  } catch (error) {
    return { error };
  }
};
