const express = require("express");
const router = express.Router();
const promotionController = require("../controller/promotion/promotion.controller");

router.post("/create", promotionController.createPromotion);
router.post("/createByUserID", promotionController.createPromotionByUserID);
router.get("/get", promotionController.getAllPromotions);
router.get("/:id", promotionController.getPromotionById);

module.exports = router;
