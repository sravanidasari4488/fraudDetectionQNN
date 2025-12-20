import supabase from "../db/supabaseClient.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * Get payment history for the authenticated user
 * @route GET /api/v1/payments/history
 */
export const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.id; // From protectedMiddleware
        const { limit = 50, offset = 0, status } = req.query;

        // Fetch payments
        let paymentsQuery = supabase
            .schema('onlyclick')
            .from('payments')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Filter by status if provided
        if (status && ['PENDING', 'COMPLETED', 'FAILED'].includes(status.toUpperCase())) {
            paymentsQuery = paymentsQuery.eq('status', status.toUpperCase());
        }

        const { data: payments, error, count } = await paymentsQuery;

        if (error) {
            throw new ApiError(500, error.message, error);
        }

        // For each payment, check if booking exists
        const transactions = await Promise.all(
            payments.map(async (payment) => {
                // Check if this payment has associated bookings using razorpay_oid
                console.log(`[Payment ${payment.id}] Looking for bookings with razorpay_oid: ${payment.razorpay_oid}`);

                const { data: bookings, error: bookingError } = await supabase
                    .schema('onlyclick')
                    .from('bookings')
                    .select('id, service_name, cart_uuid, status')
                    .eq('razorpay_oid', payment.razorpay_oid);

                if (bookingError) {
                    console.error(`[Payment ${payment.id}] Error fetching bookings:`, bookingError);
                }

                console.log(`[Payment ${payment.id}] Found ${bookings?.length || 0} bookings`);
                if (bookings && bookings.length > 0) {
                    console.log(`[Payment ${payment.id}] Booking IDs:`, bookings.map(b => b.id));
                }

                const hasBooking = bookings && bookings.length > 0;
                const bookingStatus = hasBooking ? (bookings[0].status || 'pending') : null;

                return {
                    id: payment.id,
                    amount: payment.amount,
                    status: payment.status,
                    razorpay_order_id: payment.razorpay_oid,
                    razorpay_payment_id: payment.razorpay_oid_data?.id || null,
                    items: payment.rawcart || [],
                    created_at: payment.created_at,
                    updated_at: payment.updated_at,
                    has_booking: hasBooking,
                    booking_status: bookingStatus,
                    booking_count: hasBooking ? bookings.length : 0,
                    booking_ids: hasBooking ? bookings.map(b => b.id) : [],
                };
            })
        );

        return res.status(200).json(
            new ApiResponse(200, {
                transactions,
                pagination: {
                    total: count || 0,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    has_more: (offset + limit) < (count || 0),
                },
            })
        );
    } catch (err) {
        const status = err.statusCode || 500;
        return res.status(status).json(new ApiError(status, err.message, err));
    }
};

/**
 * Get single transaction details
 * @route GET /api/v1/payments/:id
 */
export const getTransactionById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const { data: payment, error } = await supabase
            .schema('onlyclick')
            .from('payments')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error || !payment) {
            throw new ApiError(404, 'Transaction not found');
        }

        const transaction = {
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            razorpay_order_id: payment.razorpay_oid,
            razorpay_payment_id: payment.razorpay_oid_data?.id || null,
            items: payment.rawcart || [],
            created_at: payment.created_at,
            updated_at: payment.updated_at,
            razorpay_order_data: payment.razorpay_oid_data,
        };

        return res.status(200).json(new ApiResponse(200, transaction));
    } catch (err) {
        const status = err.statusCode || 500;
        return res.status(status).json(new ApiError(status, err.message, err));
    }
};
