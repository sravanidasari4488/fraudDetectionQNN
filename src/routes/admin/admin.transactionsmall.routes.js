import { Router } from "express";
import { addRemarks } from "../../controllers/admin/admin.transactionsmall.controller.js";
import { editRemarks } from "../../controllers/admin/admin.transactionsmall.controller.js";
import { addAmount } from "../../controllers/admin/admin.transactionsmall.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const smallRouter = Router();

smallRouter.put("/add-remarks", protectedMiddleware, checkAdmin, addRemarks);
smallRouter.put("/edit-remarks", protectedMiddleware, checkAdmin, editRemarks);
smallRouter.post("/add-amount", protectedMiddleware, checkAdmin, addAmount);

export default smallRouter;