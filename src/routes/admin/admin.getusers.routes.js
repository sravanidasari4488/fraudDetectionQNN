import { Router } from "express";
import { getUsers } from "../../controllers/admin/admin.getusers.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const getusersRouter = Router();

getusersRouter.get("/get-users", protectedMiddleware, checkAdmin, getUsers);

export default getusersRouter;