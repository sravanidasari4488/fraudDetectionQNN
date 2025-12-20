import { Router } from "express";
import { authControl } from "../controllers/auth.controller.js";
import { handleCallback, testLogin } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/auth", authControl);
authRouter.post("/callback", handleCallback);
authRouter.post("/test-login", testLogin);

export default authRouter;