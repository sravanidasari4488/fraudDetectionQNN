import { withdrawn } from "../../controllers/admin/admin.withdrawn.controller.js";
import { Router } from "express";

const adminWithdrawnRouter = Router();

adminWithdrawnRouter.put("/withdrawn", withdrawn);

export default adminWithdrawnRouter;