import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";

export const cancelBooking = async (req, res) => {
    const bookingId = req.params.id || req.query.id || req.body.id;

    if (!bookingId) {
        return res.status(400).json(new ApiError(400, "Booking id is required"));
    }

    try {
        const { data, error } = await supabase
            .schema("onlyclick")
            .from("bookings")
            .update({ status: "Cancelled" })
            .eq("id", bookingId)
            .select()
            .maybeSingle();

        if (error) {
            return res.status(500).json(new ApiError(500, error.message));
        }

        if (!data) {
            return res.status(404).json(new ApiError(404, "Booking not found"));
        }

        return res.status(200).json({
            message: "Booking cancelled successfully",
            data: data
        });
    } catch (error) {
        console.error("cancelBooking error:", error);
        return res.status(500).json(new ApiError(500, error.message));
    }
};