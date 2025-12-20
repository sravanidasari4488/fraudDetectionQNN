import { Router } from "express";
import { servicesDelete } from "../../controllers/admin/admin.srevices.delete.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const deleteServiceRouter = Router();

deleteServiceRouter.delete("/delete-service", protectedMiddleware, checkAdmin,servicesDelete);

export default deleteServiceRouter;