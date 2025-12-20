import { Router } from "express";
import { addBanner, deleteBanner, getBanners } from "../../controllers/admin/admin.banners.controller.js";
import protectedMiddleware from "../../middleware/protected.middleware.js";
import checkAdmin from "../../middleware/adminchecker.middleware.js";
import { upload } from "../../middleware/multer.middleware.js";

const router = Router();

// Add banner (single file field 'image')
router.post("/banners", protectedMiddleware, checkAdmin, upload.single("image"), addBanner);

// Public: Get all banners
router.get("/banners", getBanners);

// Delete banner by id
router.delete("/banners/:id", protectedMiddleware, checkAdmin, deleteBanner);

export default router;
