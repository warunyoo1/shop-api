const express = require("express");
const router = express.Router();
const promotionController = require("../controller/promotion/promotion.controller");

router.post("/", promotionController.createPromotion);
router.post("/createByUserID", promotionController.createPromotionByUserID);
router.get("/", promotionController.getAllPromotions);
router.get("/:id", promotionController.getPromotionById);

module.exports = router;
