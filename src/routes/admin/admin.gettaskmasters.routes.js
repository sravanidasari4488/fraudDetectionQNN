import { getTaskmasters } from "../../controllers/admin/admin.gettaskmaster.controller.js";
import { Router } from "express";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const getTaskmastersRouter = Router();

getTaskmastersRouter.get("/get-taskmaster", protectedMiddleware, checkAdmin, getTaskmasters);

export default getTaskmastersRouter;