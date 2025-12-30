import { Router } from "express";
import { profilePicUpdate } from "../../controllers/admin/admin.updatetmpp.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";
import { upload } from "../../middleware/multer.middleware.js";

const adminUpdatetmppRouter = Router();

adminUpdatetmppRouter.post("/updateProfilePic", protectedMiddleware, checkAdmin, upload.single("image"), profilePicUpdate);

export default adminUpdatetmppRouter;
