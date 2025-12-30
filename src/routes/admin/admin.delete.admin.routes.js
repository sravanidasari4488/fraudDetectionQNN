import { Router } from "express";
import { adminDelete } from "../../controllers/admin/admin.delete.admin.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const deleteAdminRouter = Router();

deleteAdminRouter.delete("/delete-admin", protectedMiddleware, checkAdmin,adminDelete);

export default deleteAdminRouter;