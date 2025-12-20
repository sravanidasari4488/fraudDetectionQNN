import { Router } from "express";

import { 
  getGeneralData, 
  getGeneralDataByKey, 
  updateGeneralData, 
  deleteGeneralData,
  createCoupon,
  deleteCoupon 
} from "../../controllers/admin/admin.general.data.controller.js";

const generalDataRouter = Router();

generalDataRouter.route("/general-data").get(getGeneralData);
generalDataRouter.route("/general-data").put(updateGeneralData);
generalDataRouter.route("/general-data/:key").get(getGeneralDataByKey);
generalDataRouter.route("/general-data/:key").delete(deleteGeneralData);

// Coupon specific routes
generalDataRouter.route("/coupons").post(createCoupon);
generalDataRouter.route("/coupons/:couponName").delete(deleteCoupon);

export default generalDataRouter;