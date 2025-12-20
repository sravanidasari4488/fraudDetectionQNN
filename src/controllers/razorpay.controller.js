import supabase from "../db/supabaseClient.js";
import razorpay from "../utils/RazorpayClient.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { RAZORPAY_KEY_SECRET } from "../config/env.js";
import crypto from "crypto";

// 1) Create Order (call from client before opening checkout)
export const createRazorpayOrderId = async (req, res) => {
  const { rawcart, amount } = req.body; // integer in paise
  console.log("raw cart is here ", rawcart);

  try {
    const options = {
      amount, // required (integer, in paise)
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1, // 1 = auto-capture, 0 = manual capture
    };
    const order = await razorpay.orders.create(options);

    console.log(order);

    // 2) Save payment in Supabase with razorpay_oid
    const { data, error } = await supabase
      .schema("onlyclick")
      .from("payments")
      .insert([
        {
          user_id: req.user.id,
          amount: amount / 100,
          status: "PENDING",
          razorpay_oid_data: order,
          razorpay_oid: order.id,
          rawcart: rawcart,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    return res.status(200).json(new ApiResponse(200, order)); // send order.id (e.g. order_xxx) back to client
  } catch (err) {
    console.error("Razorpay error:", err);

    // Handle different types of errors
    let errorMessage = "Failed to create order";
    let statusCode = 500;

    if (err.statusCode) {
      // Razorpay API error
      statusCode = err.statusCode;
      errorMessage = err.error?.description || err.error?.reason || "Razorpay API error";
    } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      // Network error
      errorMessage = "Network error. Please check your internet connection.";
      statusCode = 503;
    } else if (err.message) {
      // General error with message
      errorMessage = err.message;
    }

    return res.status(statusCode).json(new ApiResponse(statusCode, null, errorMessage));
  }
};

export const confirmRazorpayPayment = async (req, res) => {
  try {
    console.log("request body", req.body);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Step 1: Build the string to sign
    const signString = razorpay_order_id + "|" + razorpay_payment_id;

    // Step 2: Sign with your Razorpay Secret
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(signString.toString())
      .digest("hex");

    // Step 3: Compare signatures
    if (expectedSignature === razorpay_signature) {
      // ✅ Payment verified
      const { data, error } = await supabase
        .schema("onlyclick")
        .from("payments")
        .update({ status: "COMPLETED" })
        .eq("user_id", req.user.id)
        .eq("razorpay_oid", razorpay_order_id)
        .select();

      if (error) {
        console.log("Update error:", error);
        return res.status(500).json(new ApiResponse(500, null, "Failed to update payment status"));
      } else {
        console.log("Updated row(s):", data);
      }
      return res.status(200).json(new ApiResponse(200, { success: true, message: "Payment verified successfully" }));
    } else {
      // ❌ Invalid signature
      return res.status(400).json(new ApiResponse(400, null, "Invalid payment signature"));
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json(new ApiResponse(500, null, "Server error during payment verification"));
  }
};
