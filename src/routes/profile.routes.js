import express from "express";
import { updateProfile } from "../controllers/profile.controller.js";
import protectedMiddleware from "../middleware/protected.middleware.js";

const router = express.Router();

// Protected route - requires authentication
router.post("/update", protectedMiddleware, updateProfile);

export default router;
