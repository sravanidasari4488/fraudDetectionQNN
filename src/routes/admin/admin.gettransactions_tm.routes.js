import { get_transactions_tm } from "../../controllers/admin/admin.gettransactions_tm.controller.js";
import { Router } from "express";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const gettransactions_tmRouter = Router();

gettransactions_tmRouter.get("/get-transactions-tm", protectedMiddleware, checkAdmin, get_transactions_tm);

export default gettransactions_tmRouter;