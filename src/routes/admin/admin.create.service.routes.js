import { Router } from "express";
import {upload} from "../../middleware/multer.middleware.js"
import { adminCreateServices } from "../../controllers/admin/admin.create.services.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const adminCreateServiceRouter = Router();

adminCreateServiceRouter.post("/create-service",protectedMiddleware, checkAdmin ,upload.single("image"), adminCreateServices);

export default adminCreateServiceRouter;