import { Router } from "express";

import protectedMiddleware from "../middleware/protected.middleware.js";
import userRouter from "./user.routes.js";
import { createRazorpayOrderId, confirmRazorpayPayment } from "../controllers/razorpay.controller.js";

const razorpayRouter = Router();

razorpayRouter.post('/genrate_oid', protectedMiddleware, createRazorpayOrderId);

razorpayRouter.post('/confirm_payment', protectedMiddleware, confirmRazorpayPayment )

export default razorpayRouter;