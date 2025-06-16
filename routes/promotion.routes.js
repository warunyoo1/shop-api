const express = require("express");
const router = express.Router();
const promotionController = require("../controller/promotion/promotion.controller");

router.post("/create", promotionController.createPromotion);

module.exports = router;
