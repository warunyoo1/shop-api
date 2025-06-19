const express = require("express");
const router = express.Router();
const lotterySetsController = require("../controller/lottery/lotterySets.controller");
const lotteryTypeController = require("../controller/lottery/lotteryType.controller");
const huayController = require("../controller/lottery/huay.controller");
const bettingTypesController = require("../controller/lottery/bettingTypes.controller");

// Route to create a lottery Sets
router.post("/createSets", lotterySetsController.createLotterySets);
router.get("/getLotterySets", lotterySetsController.getLotterySets);
router.get("/getLotterySets/:id", lotterySetsController.getLotterySetsById);
router.put("/update/LotterySets/:id", lotterySetsController.updateLotterySets);
router.delete("/delete/all", lotterySetsController.deleteAllLotterySets);
router.delete("/delete/:id", lotterySetsController.deleteLottery);

// Route to create a lottery type
router.post("/createType", lotteryTypeController.createLotteryType);
router.get("/getType", lotteryTypeController.GetLotteryType);
router.delete(
  "/deleteLotteryType/:id",
  lotteryTypeController.DeleteLotteryType
);
router.put("/updateType/:id", lotteryTypeController.UpdateLotteryType);

//route  to create a Betting Types
router.post("/createBettingTypes", bettingTypesController.createBettingType);
router.get("/getBettingTypes", bettingTypesController.getBettingTypes);
router.get("/getBettingTypes/:id", bettingTypesController.getBettingTypeById);
router.put("/updateBettingTypes/:id", bettingTypesController.updateBettingType);
router.delete(
  "/deleteBettingTypes/:id",
  bettingTypesController.deleteBettingTypeById
);
router.get(
  "/getBettingTypesByLotteryType/:id",
  bettingTypesController.getBettingTypeByLotteryType
);

// Route to create a Huay ยังไม่ได้เริ่มใช้งาน
router.post("/createHuay", huayController.createHuay); //Create Huay Manual //รอเเก้ไข
router.post("/createHuayAPI", huayController.createHuayAPI); // Create Huay from API
router.get("/getHuay/all/:id", huayController.getHuay); // Get Huay //รอเเก้ไข
router.get("/getHuay/:id", huayController.getHuayById); // Get Huay by ID //รอเเก้ไข
router.put("/updateHuay/:id", huayController.updateHuay); // Update Huay //รอเเก้ไข


//ผลหวย
router.post("/getLotteryResult", huayController.evaluateLotteryResults); // Get Lottery

module.exports = router;
