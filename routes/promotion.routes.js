const express = require("express");
const router = express.Router();
const promotionController = require("../controller/promotion/promotion.controller");
const multer = require("multer");

router;

router.post("/", promotionController.createPromotion);
router.post("/createByUserID", promotionController.createPromotionByUserID);
router.get("/", promotionController.getAllPromotions);
router.get("/user", promotionController.getAllUserPromotions);
router.get("/user/:id", promotionController.getUserPromotionsById);
router.get("/:id", promotionController.getPromotionById);
router.post("/upload/:id", promotionController.uploadFile);
router.delete("/delete/:id", promotionController.deletePromotionById);

module.exports = router;
