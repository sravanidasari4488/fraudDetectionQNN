import { Router } from "express";
import protectedMiddleware from "../middleware/protected.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { avatar, deleteAvatar } from "../controllers/user_avatar.controller.js";

const avatarRouter = Router();

avatarRouter.post(
  "/avatar",
  protectedMiddleware,
  upload.single("image"),
  avatar
);
avatarRouter.delete("/avatar", protectedMiddleware, deleteAvatar);


export default avatarRouter;