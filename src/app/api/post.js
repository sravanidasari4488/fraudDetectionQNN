import api from "./api";

export const createCustomPost = async (postData) => {
  try {
    const formData = new FormData();

    // Add image if exists
    if (postData.image) {
      formData.append("image", {
        uri: postData.image,
        type: "image/jpeg",
        name: "post-image.jpg",
      });
    }

    // Add other fields
    formData.append("description", postData.description);
    formData.append("location", postData.location);
    formData.append("urgency", postData.urgency);
    formData.append("contractorPreference", postData.contractorPreference);

    const { data } = await api.post("/api/v1/custompost", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  } catch (error) {

    return { error };
  }
};
