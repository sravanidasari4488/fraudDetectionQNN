import api from "./api";

export const createRazorpayOrder  = async (rawcart, amount)=>{
    delete rawcart.count; // this count is the no of times service is booked so its of no use.so I deleted it.
    try {
        const { data } = await api.post("/api/v1/genrate_oid", { rawcart, amount });
        return data;

    } catch (error) {
  
        return { error };
    }
}

export const confirmRazorpayPayment = async (payment_data)=>{
    try {
        const {data, error} = await api.post("/api/v1/confirm_payment", payment_data);
        return{data, error};
    }catch(error){
        return{error}
    }
        
}