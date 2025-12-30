import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const {
  PORT,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_KEY_ID
} = process.env;
