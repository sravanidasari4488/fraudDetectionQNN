import { Router } from "express";
import { adminUnblockUser } from "../../controllers/admin/admin.unblock.user.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const adminUnblockUserRouter = Router();

adminUnblockUserRouter.post("/unblock-user", protectedMiddleware,checkAdmin, adminUnblockUser);

export default adminUnblockUserRouter;