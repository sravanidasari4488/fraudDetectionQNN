import { Router } from "express";
import protectedMiddleware from "../middleware/protected.middleware.js";
import { getServerTime, getAvailableSlots } from "../controllers/availability.controller.js";

const availabilityRouter = Router();

// Both endpoints protected to ensure consistent auth like rest of app
availabilityRouter.get('/time/now', protectedMiddleware, getServerTime);
availabilityRouter.get('/availability/slots', protectedMiddleware, getAvailableSlots);

export default availabilityRouter;






