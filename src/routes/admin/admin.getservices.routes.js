import { Router } from "express";
import { getServices } from "../../controllers/admin/admin.getservices.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const getServicesRouter = Router();

getServicesRouter.get("/get-services", protectedMiddleware, checkAdmin, getServices);

export default getServicesRouter;