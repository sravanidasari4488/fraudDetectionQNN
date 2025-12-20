import { Router } from "express";
import { tmauthControl, tmhandleCallback } from "../../controllers/taskmaster/auth.controller.js";

const taskMasterAuthRouter = Router();

taskMasterAuthRouter.post("/tmauth", tmauthControl);
taskMasterAuthRouter.post("/tmcallback", tmhandleCallback);

export default taskMasterAuthRouter;