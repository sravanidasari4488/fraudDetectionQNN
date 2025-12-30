import { blockTaskMaster, unBlockTaskMaster } from "../../controllers/admin/admin.blocktaskmaster.controller.js";
import { Router } from "express";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const blockTmRouter = Router();

blockTmRouter.post("/block-tm",protectedMiddleware,checkAdmin,blockTaskMaster);
blockTmRouter.post("/unblock-tm",protectedMiddleware,checkAdmin,unBlockTaskMaster);

export default blockTmRouter;