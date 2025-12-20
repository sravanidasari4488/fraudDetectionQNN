import supabase from "../db/supabaseClient.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { v4 as uuidv4 } from 'uuid';

export const addtocart = async (req, res) => {
  const { new_item } = req.body;
  delete new_item.count;  // remove count if exists, we removed this because this the total no of time the service is booked by all the users in service table. we are using count_in_cart which is specific to user cart and booking.
  console.log(new_item);

  // fetch cart from DB
  const { data: fetchcartdata, error } = await supabase
    .schema("onlyclick")
    .from("users")
    .select("cart")
    .eq("user_id", req.user.id)
    .single();

  if (error) {
    throw new ApiError(500, "Something went wrong in cart controller", error);
  }

  const updatedCart = fetchcartdata.cart || { items: [] };
  const cartItems = updatedCart.items;

  // check if item already exists
  const existingItemIndex = cartItems.findIndex(
    (item) => item.service_id === new_item.service_id
  );

  if (existingItemIndex !== -1) {
    // item exists, increment count_in_cart
    cartItems[existingItemIndex].count_in_cart =
      (cartItems[existingItemIndex].count_in_cart || 0) + 1;
  } else {
    // item does not exist, initialize count_in_cart
    new_item.count_in_cart = 1;
    cartItems.push(new_item);
  }

  // update DB
  const { data, error: error2 } = await supabase
    .schema("onlyclick")
    .from("users")
    .update({ cart: updatedCart })
    .eq("user_id", req.user.id)
    .select();

  if (error2) {
    throw new ApiError(500, "Unable to update the cart in database", error2);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { updatedCart, data }));
};


export const removeOneFromCart = async (req, res) => {
  const { service_id } = req.body; // get service_id from request body

  try {
    // Step 1: Fetch cart from DB
    const { data: fetchcartdata, error: fetchError } = await supabase
      .schema("onlyclick")
      .from("users")
      .select("cart")
      .eq("user_id", req.user.id)
      .single();

    if (fetchError) {
      throw new ApiError(500, "Something went wrong while fetching cart", fetchError);
    }

    if (!fetchcartdata?.cart) {
      throw new ApiError(404, "Cart not found for user");
    }

    const updatedCart = fetchcartdata.cart;
    const cartItems = updatedCart.items || [];

    // Step 2: Find the item in cart
    const existingItemIndex = cartItems.findIndex(
      (item) => item.service_id === service_id
    );

    if (existingItemIndex === -1) {
      throw new ApiError(404, "Item not found in cart");
    }

    // Step 3: If count_in_cart > 1, decrement, else remove the item
    if (cartItems[existingItemIndex].count_in_cart > 1) {
      cartItems[existingItemIndex].count_in_cart -= 1;
    } else {
      cartItems.splice(existingItemIndex, 1);
    }

    // Step 4: Update DB
    const { data, error: updateError } = await supabase
      .schema("onlyclick")
      .from("users")
      .update({ cart: updatedCart })
      .eq("user_id", req.user.id)
      .select("cart")
      .single();

    if (updateError) {
      throw new ApiError(500, "Unable to update cart in database", updateError);
    }

    return res.status(200).json(new ApiResponse(200, { updatedCart, data }));
  } catch (error) {
    console.error("Error removing from cart:", error);
    return res.status(error.statusCode || 500).json(
      new ApiError(error.statusCode || 500, error.message, error)
    );
  }
};

export const addOneInCart = async (req, res) => {
  const { service_id } = req.body; // get service_id from request body

  try {
    // Step 1: Fetch cart from DB
    const { data: fetchcartdata, error: fetchError } = await supabase
      .schema("onlyclick")
      .from("users")
      .select("cart")
      .eq("user_id", req.user.id)
      .single();

    if (fetchError) {
      throw new ApiError(500, "Something went wrong while fetching cart", fetchError);
    }

    if (!fetchcartdata?.cart) {
      throw new ApiError(404, "Cart not found for user");
    }

    const updatedCart = fetchcartdata.cart; // clone the cart object
    const cartItems = updatedCart.items || [];  // get the items array

    // Step 2: Find the item in cart
    const existingItemIndex = cartItems.findIndex(
      (item) => item.service_id === service_id
    );

    if (existingItemIndex === -1) {
      throw new ApiError(404, "Item not found in cart");
    }

    // Step 3: Increment count_in_cart
    cartItems[existingItemIndex].count_in_cart += 1;

    // Step 4: Update DB
    const { data, error: updateError } = await supabase
      .schema("onlyclick")
      .from("users")
      .update({ cart: updatedCart })
      .eq("user_id", req.user.id)
      .select("cart")
      .single();

    if (updateError) {
      throw new ApiError(500, "Unable to update cart in database", updateError);
    }

    return res.status(200).json(new ApiResponse(200, { updatedCart, data }));
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(error.statusCode || 500).json(
      new ApiError(error.statusCode || 500, error.message, error)
    );
  }
};

export const removeAllFromCart = async (req, res) => {
  const { service_id } = req.body; // get service_id from request body

  try {
    // Step 1: Fetch cart from DB
    const { data: fetchcartdata, error: fetchError } = await supabase
      .schema("onlyclick")
      .from("users")
      .select("cart")
      .eq("user_id", req.user.id)
      .single();

    if (fetchError) {
      throw new ApiError(500, "Something went wrong while fetching cart", fetchError);
    }

    if (!fetchcartdata?.cart) {
      throw new ApiError(404, "Cart not found for user");
    }

    const updatedCart = fetchcartdata.cart;
    const cartItems = updatedCart.items || [];

    // Step 2: Find the item in cart
    const existingItemIndex = cartItems.findIndex(
      (item) => item.service_id === service_id
    );

    if (existingItemIndex === -1) {
      throw new ApiError(404, "Item not found in cart");
    }

    // Step 3: Remove the item
    cartItems.splice(existingItemIndex, 1);

    // Step 4: Update DB
    const { data, error: updateError } = await supabase
      .schema("onlyclick")
      .from("users")
      .update({ cart: updatedCart })
      .eq("user_id", req.user.id)
      .select("cart")
      .single();

    if (updateError) {
      throw new ApiError(500, "Unable to update cart in database", updateError);
    }

    return res.status(200).json(new ApiResponse(200, { updatedCart, data }));
  } catch (error) {
    console.error("Error removing from cart:", error);
    return res.status(error.statusCode || 500).json(
      new ApiError(error.statusCode || 500, error.message, error)
    );
  }
};


export const confirmBookings = async (req, res) => {

  console.log("bookings data", req.body);

  async function createBookingData(data) {
    const {
      items,
      location,
      dateitem,
      time,
      paymentmethod,
      razorpay_oid,
      pricing_summary,
      ph_no,
      coupon_applied = false,
      coupon_code = null,
      prebooking_discount_percent = 0,
      system_config = {}
    } = data;

    const year = new Date().getFullYear(); // current year

    // Generate a 4-digit OTP for this booking session
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Generate a UUID for this cart session
    const cart_uuid = uuidv4();

    // Fetch user data once before mapping
    const { data: userdata, error: usererror } = await supabase
      .schema('onlyclick')
      .from('users')
      .select("full_name, avatar_url")
      .eq("user_id", req.user.id)
      .single();

    if (usererror) {
      console.log('Error fetching user data:', usererror);
      throw new ApiError(500, "Error fetching user data", usererror);
    }

    console.log('User data:', userdata);
    console.log('Generated OTP for this booking session:', otp);
    console.log('Pricing summary:', pricing_summary);

    return items.map(item => {
      const count = item.count_in_cart;

      // Use the new pricing system data from frontend and multiply by quantity
      const basePrice = item.service_price; // Price after prebooking discount (per unit)
      const convenienceFee = item.convenience_fee; // Per unit
      const totalPrice = item.total_price; // Per unit (basePrice + convenienceFee)

      // Calculate total amounts for this item based on quantity
      const totalBasePriceForItem = basePrice * count;
      const totalConvenienceFeeForItem = convenienceFee * count;
      const totalPriceForItem = totalPrice * count;
      const tmShareForItem = item.tm_share * count; // TM share per unit × quantity
      const companyShareForItem = item.company_share * count; // Company share per unit × quantity

      // Calculate final payment amount and company share based on payment method
      let finalPaymentAmount;
      let finalCompanyShare;

      if (paymentmethod === 'Online Payment') {
        // For online payment: user paid total with online discount
        finalPaymentAmount = pricing_summary.total_with_online_discount;
        finalCompanyShare = (item.final_company_share || item.company_share) * count; // company share minus online discount, multiplied by quantity
      } else {
        // For pay on service: user paid company share online, will pay TM share to provider
        finalPaymentAmount = pricing_summary.amount_paid_online; // Only company share
        finalCompanyShare = companyShareForItem; // Full company share (no online discount) × quantity
      }

      const dateStr = `${year}-${dateitem.month}-${dateitem.dateNumber} ${time.time}`;

      function toISTTimestampz(input) {
        // Parse the date string using JS Date
        const date = new Date(input);

        if (isNaN(date.getTime())) {
          throw new Error("Invalid date format. Expected 'YYYY-MMM-DD hh:mm AM/PM'");
        }

        // Extract local parts
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // 0-based
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        // Append IST offset manually (+05:30)
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      }

      const isoTime = toISTTimestampz(dateStr)

      return {
        user_id: req.user.id,
        service_uuid: item.service_id,
        time_slot: isoTime,
        location: location,
        estimated_duration: item.duration,
        payment_method: paymentmethod,
        service_name: item.title,
        category: item.category.toLowerCase(),
        count: count,
        payment_amount: finalPaymentAmount, // Total amount paid online
        service_price: basePrice, // Service price per unit after prebooking discount
        razorpay_oid: razorpay_oid,
        user_name: userdata.full_name || 'Valued Customer',
        user_avatar: userdata.avatar_url,
        user_ph: ph_no || userdata.ph_no || 9876543210,
        otp: otp,
        cart_uuid: cart_uuid,
        company_share: finalCompanyShare, // Company share for total quantity (adjusted for online discount if applicable)
        tm_share: tmShareForItem, // TM share for total quantity to be paid to provider
        // Additional metadata for reference (can be used for reporting/analytics)

      };
    });
  }

  const saveBookings = async () => {
    try {
      const bookingsArray = await createBookingData(req.body);
      console.log("bookings array: ", bookingsArray);

      // Validate: each booking's time_slot must be >= server now + 6 hours and not already booked
      const now = new Date();
      const minAllowed = new Date(now.getTime() + 6 * 60 * 60 * 1000);

      for (const b of bookingsArray) {
        // Parse time_slot as local time (matches storage format without timezone)
        const slot = new Date(b.time_slot);
        if (isNaN(slot.getTime())) {
          throw new ApiError(400, "Invalid time slot format");
        }
        if (slot.getTime() < minAllowed.getTime()) {
          throw new ApiError(400, `Selected time slot must be at least 6 hours from now. Current time: ${now.toISOString()}, Selected: ${b.time_slot}`);
        }

        const { data: existing, error: existErr } = await supabase
          .schema("onlyclick")
          .from("bookings")
          .select("id")
          .eq("time_slot", b.time_slot)
          .limit(1);

        if (existErr) {
          throw new ApiError(500, "Error checking slot availability", existErr);
        }
        if (existing && existing.length > 0) {
          throw new ApiError(409, "Selected time slot is no longer available");
        }
      }

      const { data, error } = await supabase
        .schema("onlyclick")
        .from("bookings")
        .insert(bookingsArray)
        .select();

      console.log("Inserted bookings:", bookingsArray);

      if (error) throw error;

      console.log("Bookings saved successfully:", data);
      return { data, error: null };
    } catch (err) {
      console.error("Error saving bookings:", err);
      throw new ApiError(500, "error saving bookings to database", err)
    }
  };

  const bookingResult = await saveBookings();

  // Clear the cart after successful booking
  const { data, error } = await supabase
    .schema("onlyclick")
    .from("users")
    .update({
      cart: {
        "items": []
      }
    })
    .eq("user_id", req.user.id)

  if (error) {
    throw new ApiError(500, "error clearing cart", error)
  }

  return res.status(200).json(
    new ApiResponse(200, {
      message: "success",
      bookings: bookingResult.data
    })
  )
}
