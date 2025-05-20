const express = require("express");
const router = express.Router();
const lotteryController = require("../controller/lottery/lottery.controller");
const lotteryCategoryController = require("../controller/lottery/lotteryCategory.controller");

// Route to create a lottery
router.post("/create", lotteryController.createLottery);
router.get("/getLottery", lotteryController.getLottery);
router.get("/getLottery/:id", lotteryController.getLotteryById);
router.put("/update/:id", lotteryController.updateLottery);
router.delete("/delete/all", lotteryController.deleteAllLottery);
router.delete("/delete/:id", lotteryController.deleteLottery);

// Route to create a lottery category
router.post("/createCategory", lotteryCategoryController.createLotteryCategory);
router.get("/getCategory", lotteryCategoryController.GetLotteryCategory);
router.delete(
  "/deleteCategory/:id",
  lotteryCategoryController.DeleteLotteryCategory
);
router.put(
  "/updateCategory/:id",
  lotteryCategoryController.UpdateLotteryCategory
);

module.exports = router;
