const express = require("express");
const router = express.Router();
const withdrawalController = require("../controller/withdrawal/withdrawal.controller");

// Routes สำหรับ User
router.post("/create", withdrawalController.createWithdrawal);
router.get("/user/:user_id", withdrawalController.getWithdrawalsByUserId);
router.put("/update/:id", withdrawalController.updateWithdrawal);
router.put("/cancel/:id", withdrawalController.cancelWithdrawal);

// Routes สำหรับ Admin
router.get("/get", withdrawalController.getAllWithdrawals);
router.get("/getbyid/:id", withdrawalController.getWithdrawalById);
router.put("/approve/:id", withdrawalController.approveWithdrawal);
router.put("/reject/:id", withdrawalController.rejectWithdrawal);
router.put("/complete/:id", withdrawalController.completeWithdrawal);

router.post("/deduct-admin/", withdrawalController.deductFromAdmin);

router.delete("/delete/:id", withdrawalController.deleteWithdrawal);

 //หักเงินจาก admin 
 
module.exports = router; 