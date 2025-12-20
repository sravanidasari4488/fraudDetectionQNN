import { Router } from "express";
import { adminAuthControl } from "../../controllers/admin/admin.auth.controller.js";

const adminAuthRouter = Router();

adminAuthRouter.post("/auth", adminAuthControl);

export default adminAuthRouter;