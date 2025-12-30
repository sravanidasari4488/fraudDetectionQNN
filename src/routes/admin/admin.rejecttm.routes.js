import { Router } from "express";
import { rejecttm } from "../../controllers/admin/admin.rejecttm.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";


const rejecttmRouter = Router();

rejecttmRouter.delete('/reject-tm/:id', protectedMiddleware, checkAdmin,rejecttm);

export default rejecttmRouter;