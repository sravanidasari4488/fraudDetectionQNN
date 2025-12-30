import { Router } from "express";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import { updateTMProfile } from "../../controllers/taskmaster/TMprofile.controller.js";

const taskMasterProfileRouter = Router();

taskMasterProfileRouter.post("/updateTM", protectedMiddleware, updateTMProfile);

export default taskMasterProfileRouter;