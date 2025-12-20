import { Router } from "express";
import protectedMiddleware from "../middleware/protected.middleware.js";
import { getPaymentHistory, getTransactionById } from "../controllers/payment.controller.js";

const paymentRouter = Router();

// Get payment history for authenticated user
paymentRouter.get('/history', protectedMiddleware, getPaymentHistory);

// Get single transaction details
paymentRouter.get('/:id', protectedMiddleware, getTransactionById);

export default paymentRouter;
