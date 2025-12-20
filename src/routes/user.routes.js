import { Router } from "express";
import { updateProfile } from "../controllers/profile.controller.js";
import protectedMiddleware from "../middleware/protected.middleware.js";

const userRouter = Router();

userRouter.post("/update", protectedMiddleware, updateProfile);

export default userRouter;
