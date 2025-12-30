import { Router } from "express";
import protectedMiddleware from "../middleware/protected.middleware.js";
import { saveUserLocation } from "../controllers/location.controller.js";

const locationRouter = Router();

locationRouter.post('/location/update', protectedMiddleware, saveUserLocation);

export default locationRouter;




