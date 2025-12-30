import { Router } from "express";
import { getBlockedUser } from "../../controllers/admin/admin.get.blocked.users.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const getBlockedUserRouter = Router();

getBlockedUserRouter.get("/get-blocked-users", protectedMiddleware, checkAdmin ,getBlockedUser);

export default getBlockedUserRouter;