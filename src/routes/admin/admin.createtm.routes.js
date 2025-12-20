import { Router } from "express";
import { createTm } from "../../controllers/admin/admin.createtm.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const createTmRouter = Router();

createTmRouter.post("/create-taskmaster", protectedMiddleware, checkAdmin, createTm);

export default createTmRouter;