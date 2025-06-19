const express = require("express");
const router = express.Router();
const userController = require("../controller/user/user.controller");
const betController = require("../controller/user/bet/user.bet.controller");
const authmiddleware = require("../middleware/authadmin.middleware");
const lotteryController = require("../controller/user/lottery/lottery.controller");

router.post("/register", userController.register);

// ส่วนของ user ที่ใช้ได้
router.get("/getbyid/:id", authmiddleware.isUser, userController.getUserById);
router.put("/update/:id", authmiddleware.isUser, userController.updateUser);
// ส่วนของ admin จัดการ user
router.get("/get", authmiddleware.isAdmin, userController.getAllUsers);
router.delete("/delete/:id", authmiddleware.isAdmin, userController.deleteUser);
router.put("/active/:id", authmiddleware.isAdmin, userController.activeUser);
router.put(
  "/deactive/:id",
  authmiddleware.isAdmin,
  userController.deactiveUser
);

// ส่วนของ lottery user
router.get("/lottery", lotteryController.getLotteryUserSets);

// ส่วนของ user bet
router.post("/bet", authmiddleware.isUser, betController.createUserBet);
router.get("/bet/:id", authmiddleware.isUser, betController.getUserBetsById);
router.get("/bet/find/all", authmiddleware.isUser, betController.getUserBetAll);

module.exports = router;
