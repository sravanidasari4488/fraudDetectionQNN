import { Router } from "express";
import { adminEditServiceImage } from "../../controllers/admin/admin.edit.service.image.controller.js";
import {upload} from "../../middleware/multer.middleware.js"
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const adminEditServiceImageRouter = Router();

adminEditServiceImageRouter.put(
  "/service-image-edit/:id",
  protectedMiddleware,
  checkAdmin,
  upload.single("image"),
  adminEditServiceImage
);

export default adminEditServiceImageRouter;