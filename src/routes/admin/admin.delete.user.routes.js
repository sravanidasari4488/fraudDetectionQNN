import { Router } from "express";
import { adminBlockUser } from "../../controllers/admin/admin.block.user.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const adminDeleteUserRouter = Router();
adminDeleteUserRouter.post("/block-user", protectedMiddleware, checkAdmin ,adminBlockUser);

export default adminDeleteUserRouter;