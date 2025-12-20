import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";





export const getAvailableJobs = async (req, res) => {


    try {
        function timeAgo(createdAt) {
            const now = new Date();
            const created = new Date(createdAt);
            const diffMs = now - created;
            const diffMins = Math.floor(diffMs / (1000 * 60));

            if (diffMins < 1) return "Just now";
            if (diffMins < 60) return `${diffMins} mins ago`;

            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours} hours ago`;

            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays} days ago`;
        }


        function transformBookings(bookings) {
            return bookings.map(b => ({
                _id: b.id,
                customerName: b.user_name || "OnlyClick User",
                serviceName: b.service_name,
                address: b.location,
                image: b.user_avatar,
                distance: b.distance,
                estimatedTime: b.estimated_duration,
                payment: b.tm_share ? `₹${b.tm_share}` : "₹0",
                urgency: "Medium", // static for now
                customerRating: 4.8, // static/dummy
                jobPostedTime: timeAgo(b.created_at),
                description: b.remarks || "No additional details provided",
                serviceType: b.category,
                customerPhone: b.user_ph,
                paymentMethod: b.payment_method,
                timeSlot: b.time_slot,
                cartUuid: b.cart_uuid,
                count: b.count,
            }));
        }



        const { data: category, error: categoryError } = await supabase
            .schema('onlyclick')
            .from('taskmaster')
            .select("categories")
            .eq('tm_id', req.user.id)
            .single();

        if (categoryError) throw categoryError;

        const { data, error } = await supabase
            .schema('onlyclick')
            .from('bookings')
            .select("*")
            .eq('status', 'Pending')
            .eq('category', category.categories);


        if (error) throw error;

        const transformedData = transformBookings(data)
        return res.status(200).json(
            new ApiResponse(200, transformedData)
        )
    } catch (error) {
        console.error(error);
        return res.status(400).json(
            new ApiError(400, error.message, error)
        )
    }
}


export const getInProgressJobs = async (req, res) => {

    try {
        function timeAgo(createdAt) {
            const now = new Date();
            const created = new Date(createdAt);
            const diffMs = now - created;
            const diffMins = Math.floor(diffMs / (1000 * 60));

            if (diffMins < 1) return "Just now";
            if (diffMins < 60) return `${diffMins} mins ago`;

            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours} hours ago`;

            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays} days ago`;
        }

        function transformBookings(bookings) {
            return bookings.map(b => ({
                _id: b.id,
                customerName: b.user_name || "OnlyClick User",
                serviceName: b.service_name || "Unknown Service",
                address: b.location || "No Address Provided",
                image: b.user_avatar,
                distance: b.distance || "dist",
                estimatedTime: b.estimated_duration || "45 mins",
                payment: b.tm_share ? `₹${b.tm_share}` : "₹0",
                urgency: "Medium", // static for now
                customerRating: 4.8, // static/dummy
                jobPostedTime: timeAgo(b.created_at),
                description: b.remarks || "No additional details provided",
                serviceType: b.category,
                customerPhone: b.user_ph,
                paymentMethod: b.payment_method,
                timeSlot: b.time_slot,
                cartUuid: b.cart_uuid,
                count: b.count,
            }));
        }


        const { data, error } = await supabase
            .schema('onlyclick')
            .from('bookings')
            .select("*")
            .eq('status', 'Accepted')
            .eq('tm_id', req.user.id);


        if (error) throw error;

        const transformedData = transformBookings(data)
        return res.status(200).json(
            new ApiResponse(200, transformedData)
        )
    } catch (error) {
        console.error(error);
        return res.status(400).json(
            new ApiError(400, error.message, error)
        )
    }
}
export const getCompleted = async (req, res) => {

    try {
        function timeAgo(createdAt) {
            const now = new Date();
            const created = new Date(createdAt);
            const diffMs = now - created;
            const diffMins = Math.floor(diffMs / (1000 * 60));

            if (diffMins < 1) return "Just now";
            if (diffMins < 60) return `${diffMins} mins ago`;

            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours} hours ago`;

            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays} days ago`;
        }

        function transformBookings(bookings) {
            return bookings.map(b => ({
                _id: b.id,
                customerName: b.user_name || "OnlyClick User",
                serviceName: b.service_name || "Unknown Service",
                address: b.location || "No Address Provided",
                image: b.user_avatar,
                distance: b.distance || "dist",
                estimatedTime: b.estimated_duration || "45 mins",
                payment: b.tm_share ? `₹${b.tm_share}` : "₹0",
                urgency: "Medium", // static for now
                customerRating: 4.8, // static/dummy
                jobPostedTime: timeAgo(b.created_at),
                description: b.remarks || "No additional details provided",
                serviceType: b.category,
                customerPhone: b.user_ph,
                status: b.status,
                paymentMethod: b.payment_method,
                timeSlot: b.time_slot,
                cartUuid: b.cart_uuid,
                count: b.count,
            }));
        }


        const { data, error } = await supabase
            .schema('onlyclick')
            .from('bookings')
            .select("*")
            .in('status', ['Completed', 'Cancelled'])
            .eq('tm_id', req.user.id);

        if (error) throw error;

        const transformedData = transformBookings(data)
        return res.status(200).json(
            new ApiResponse(200, transformedData)
        )
    } catch (error) {
        console.error(error);
        return res.status(400).json(
            new ApiError(400, error.message, error)
        )
    }
}


export const acceptJob = async (req, res) => {
    try {
        const tm = req.user;
        const bookingData = req.body;

        // First, check the current status
        const { data: statusData, error: statusError } = await supabase
            .schema('onlyclick')
            .from('bookings')
            .select('status')
            .eq('id', bookingData._id)
            .single();

        if (statusError) throw statusError;

        if (statusData.status !== 'Pending') {
            return res.status(400).json(
                new ApiError(400, 'Service already accepted by someone else')
            );
        }

        // Create timestamp without time zone
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        // Update the booking
        const { data: acceptJobdata, error: acceptJoberror } = await supabase
            .schema('onlyclick')
            .from('bookings')
            .update({
                'tm_id': tm.id,
                'tm_contact': tm.ph_no,
                'tm_profilepic': tm.tm_profilepic,
                'tm_name': tm.name,
                'date_time_accepted': timestamp,
                'status': 'Accepted'
            })
            .eq('id', bookingData._id)
            .eq('status', 'Pending')  // Ensure it's still pending
            .select();

        if (acceptJoberror) throw acceptJoberror;

        if (!acceptJobdata || acceptJobdata.length === 0) {
            return res.status(400).json(
                new ApiError(400, 'Service already accepted by someone else')
            );
        }

        return res.status(200).json(
            new ApiResponse(200, { success: true })
        );
    } catch (error) {
        console.error(error);
        return res.status(500).json(
            new ApiError(500, error.message, error)
        );
    }
}


// verify job otp, update the wallet and mark it as completed
export const verifyJobOtp = async (req, res) => {
    try {
        const tm = req.user;
        const bookingData = req.body;

        // Create timestamp with time zone
        const now = new Date();
        const timestampz = now.toISOString();

        // Debug logging to check data types
        console.log("Booking ID:", bookingData._id, "Type:", typeof bookingData._id);
        console.log("TM ID:", tm.id, "Type:", typeof tm.id);
        console.log("OTP:", req.body.otp, "Type:", typeof req.body.otp);

        // Use atomic database transaction that includes OTP verification to prevent all race conditions
        const { data: result, error: completeJobError } = await supabase
            .rpc('complete_job_with_otp_verification', {
                p_booking_id: parseInt(bookingData._id), // Ensure it's an integer
                p_tm_id: tm.id, // This should be UUID
                p_provided_otp: String(req.body.otp), // Ensure it's a string
                p_timestamp: timestampz
            });

        if (completeJobError) {
            console.error("Complete job error:", completeJobError);
            throw completeJobError;
        }

        if (!result || !result.success) {
            console.log("Function returned failure:", result);
            return res.status(400).json(
                new ApiError(400, result?.message || 'Invalid OTP or job already completed')
            );
        }

        console.log("Job completed successfully:", result);

        return res.status(200).json(
            new ApiResponse(200, {
                success: true,
                wallet_updated: result.wallet_updated,
                amount_credited: result.amount_credited
            })
        );
    } catch (error) {
        console.error("Error completing job:", error);
        return res.status(500).json(
            new ApiError(500, error.message, error)
        );
    }
}