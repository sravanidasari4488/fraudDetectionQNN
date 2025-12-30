import { Router } from "express";
import { updateService } from "../../controllers/admin/admin.update.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const adminServiceEditRouter = Router();

adminServiceEditRouter.put("/edit-service", protectedMiddleware, checkAdmin ,updateService);

export default adminServiceEditRouter;