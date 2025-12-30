import { get_tmapplyrequest } from "../../controllers/admin/admin.gettmapplyrequest.controller.js";
import { Router } from "express";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const getTmApplyRequestRouter = Router();

getTmApplyRequestRouter.get("/get-tm-apply-request", protectedMiddleware, checkAdmin, get_tmapplyrequest);

export default getTmApplyRequestRouter;