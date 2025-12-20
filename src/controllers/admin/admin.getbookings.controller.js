import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";

export const admingetBookings = async(req, res)=>{
    try{
        const { data: Bookingsdata, error } = await supabase
          .schema("onlyclick")
          .from("bookings")
          .select(
            "date_time_accepted,id, date_time_completed, created_at, time_slot, request_sent_to, user_id, tm_id,tm_name, status, location, payment_method, complaints, imp_note, service_name, category, count, booking_uuid, razorpay_oid, user_name, user_avatar, company_share, tm_share, cart_uuid, otp"
          );

        if(error) throw new ApiError(404, error.message);

        // Get users who have bookings
        const userIds = Bookingsdata.map(b => b.user_id);

        const { data: userData, error: userError } = await supabase
          .schema("onlyclick")
          .from("users")
          .select("id, user_id, full_name")
          .in("user_id", userIds);

        console.log("User data:", userData);
        console.log("User IDs from bookings:", userIds);

        if(userError) throw new ApiError(404, userError.message);

        // Create a map for quick user lookup using user_id as key
        const userMap = new Map();
        userData.forEach(user => {
          userMap.set(user.user_id, user); // Use user_id as key since booking.user_id matches users.user_id
        });

        // Add user info to each booking
        const data = Bookingsdata.map(booking => {
          const user = userMap.get(booking.user_id);
          console.log(`Booking ${booking.id}: user_id=${booking.user_id}, found user:`, user);
          return {
            ...booking,
            user: user ? { 
              id: user.id,           // users.id (primary key)
              user_id: user.user_id, // users.user_id 
              name: user.full_name 
            } : null
          };
        });
        console.log("Final data sample:", data.slice(0, 2)); // Log first 2 bookings
        console.log(data);
        return res.status(200).json(data);
    }catch(error){
      console.log(error);
        return res.status(404).json(new ApiError(404, error.message));
    }
}