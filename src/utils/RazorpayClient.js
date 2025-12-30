import Razorpay from 'razorpay';
import { ApiError } from "../utils/ApiError.js";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '../config/env.js';

console.log("these are keys", RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET);

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  throw new ApiError(500, "Razorpay Keys are needed");
}

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export default razorpay;