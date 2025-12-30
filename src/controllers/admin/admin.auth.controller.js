import supabase from "../../db/supabaseClient.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const adminAuthControl = async(req, res)=>{
    const {email} = req.body;
    try{
        const{data: adminUser, error: adminErr} = await supabase
        .schema("onlyclick")
        .from("admins")
        .select("adminemail")
        .eq("adminemail", email)
        .maybeSingle();
        if(adminErr) throw adminErr;
        if(!adminUser){
            return res.status(403).json(new ApiResponse(400, null, "Access denied"));
        }

        const { data, error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: "https://onlyclick-admin-panel.vercel.app/",
            // emailRedirectTo: "http://localhost:3000/",
          },
        });
        if(error) throw error;
        return res.status(200).json(new ApiResponse(200, null, "Magic link sent to admin email"));
    }catch(error){
        return res.status(400).json(new ApiResponse(400, null, error.message))
    }
}