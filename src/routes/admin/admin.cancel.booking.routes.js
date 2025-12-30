import { Router } from "express";
import { cancelBooking } from "../../controllers/admin/admin.cancel.booking.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const cancelBookingRouter = Router();

// Cancel booking by id
cancelBookingRouter.put("/cancel-booking/:id", protectedMiddleware, checkAdmin, cancelBooking);

export default cancelBookingRouter;