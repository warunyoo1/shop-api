const express = require("express");
const router = express.Router();
const lotterySetsController = require("../controller/lottery/lottery.controller");
const lotteryTypeController = require("../controller/lottery/lotteryType.controller");
const huayController = require("../controller/lottery/huay.controller");

// Route to create a lottery
router.post("/createSets", lotterySetsController.createLotterySets);
router.get("/getLotterySets", lotterySetsController.getLotterySets);
router.get("/getLotterySets/:id", lotterySetsController.getLotterySetsById);
router.put("/update/LotterySets/:id", lotterySetsController.updateLotterySets);
router.delete("/delete/all", lotterySetsController.deleteAllLotterySets);
router.delete("/delete/:id", lotterySetsController.deleteLottery);

// Route to create a lottery category
router.post("/createType", lotteryTypeController.createLotteryType);
router.get("/getType", lotteryTypeController.GetLotteryType);
router.delete(
  "/deleteLotteryType/:id",
  lotteryTypeController.DeleteLotteryType
); //รอเเก้ไข
router.put("/updateCategory/:id", lotteryTypeController.UpdateLotteryCategory); //รอเเก้ไข

// Route to create a Huay ยังไม่ได้เริ่มใช้งาน
router.post("/createHuay", huayController.createHuay); //Create Huay Manual //รอเเก้ไข
router.post("/createHuayAPI", huayController.createHuayAPI); // Create Huay from API //รอเเก้ไข
router.get("/getHuay/all/:id", huayController.getHuay); // Get Huay //รอเเก้ไข
router.get("/getHuay/:id", huayController.getHuayById); // Get Huay by ID //รอเเก้ไข
router.put("/updateHuay/:id", huayController.updateHuay); // Update Huay //รอเเก้ไข

module.exports = router;
