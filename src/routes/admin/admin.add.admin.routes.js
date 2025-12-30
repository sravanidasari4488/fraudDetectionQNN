import { Router } from "express";
import { addAdmin } from "../../controllers/admin/admin.add.admin.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const addAdminRouter = Router();

addAdminRouter.post("/add-admin", protectedMiddleware, checkAdmin, addAdmin);

export default addAdminRouter;