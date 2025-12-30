import { admingetBookings } from "../../controllers/admin/admin.getbookings.controller.js";
import { Router } from "express";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const adminGetBookingsRouter = Router();

adminGetBookingsRouter.get("/get-bookings", protectedMiddleware, checkAdmin,admingetBookings);

export default adminGetBookingsRouter;