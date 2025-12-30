import { Router } from "express";
import { accepttm } from "../../controllers/admin/admin.accepttm.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const acceptTmRouter = Router();

// Accept a taskmaster application by id (route param)
acceptTmRouter.post(
	"/accept-tm/:id",
	protectedMiddleware,
	checkAdmin,
	accepttm
);

export default acceptTmRouter;