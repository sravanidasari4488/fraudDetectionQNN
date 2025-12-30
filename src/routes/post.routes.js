import { Router } from "express";
import protectedMiddleware from "../middleware/protected.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { createCustomPost } from "../controllers/post.controller.js";

const postRouter = Router();

postRouter.post(
  "/custompost",
  protectedMiddleware,
  upload.single("image"),
  createCustomPost
);

export default postRouter;
