const express = require("express");
const router = express.Router();
const lotteryController = require("../controller/lottery/lottery.controller");
const lotteryCategoryController = require("../controller/lottery/lotteryCategory.controller");


// Route to create a lottery
router.post("/create", lotteryController.createLottery);


// Route to create a lottery category
router.post("/createCategory", lotteryCategoryController.createLotteryCategory);

module.exports = router;
