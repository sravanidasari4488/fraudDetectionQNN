import { Router } from "express";
import { getAdmins } from "../../controllers/admin/admin.getadmins.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const getAdminsRouter = Router();

getAdminsRouter.get("/get-admins", protectedMiddleware, checkAdmin, getAdmins);

export default getAdminsRouter;