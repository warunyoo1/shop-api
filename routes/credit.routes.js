const express = require("express");
const router = express.Router();
const creditController = require("../controller/credit/credit.controller");

router.post("/create", creditController.createCredit);
router.get("/get", creditController.getAllCredits);
router.get("/getbyid/:id", creditController.getCreditsByID);
router.get("/user/:user_id", creditController.getCreditsByUserId);

// เพิ่ม routes ใหม่
router.put("/update/:id", creditController.updateCredit);
router.put("/approve/:id", creditController.approveCredit);
router.put("/cancel/:id", creditController.cancelCredit);
router.delete("/delete/:id", creditController.deleteCredit);

// ยังไม่ใช้
router.get("/days/check", creditController.getTopupDays);

module.exports = router;
