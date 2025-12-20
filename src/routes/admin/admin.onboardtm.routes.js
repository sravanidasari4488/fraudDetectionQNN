import { Router } from "express";
import { onboardTM } from "../../controllers/admin/admin.onboardtm.controller.js";

const onBoardTmRouter = Router();

onBoardTmRouter.post("/onboard-tm", onboardTM);

export default onBoardTmRouter;