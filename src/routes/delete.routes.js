import { Router } from "express";
import protectedMiddleware from "../middleware/protected.middleware.js";
import { deleteUser } from "../controllers/delete.controller.js";

const deleteRouter = Router();

deleteRouter.delete("/delete", protectedMiddleware, deleteUser);

export default deleteRouter;