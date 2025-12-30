import { Router } from "express";
import { get_tm_share, get_company_share, get_total_earned, get_wallet, get_withdrawn } from "../../controllers/admin/admin.transactions.get.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";

const getTransactionRouter = Router();

getTransactionRouter.get("/get-tm-share", protectedMiddleware, checkAdmin, get_tm_share);
getTransactionRouter.get("/get-company-share", protectedMiddleware, checkAdmin, get_company_share);
getTransactionRouter.get("/get-wallet", protectedMiddleware, checkAdmin, get_wallet);
getTransactionRouter.get("/get-total-earned", protectedMiddleware, checkAdmin, get_total_earned);
getTransactionRouter.get("/get-withdrawn", protectedMiddleware, checkAdmin, get_withdrawn);

export default getTransactionRouter;