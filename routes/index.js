// routes/index.js
const express = require("express");
const router = express.Router();
const userRoutes = require("./user.routes");
const authRoutes = require("../controller/auth/auth.controller");
const superadminRoutes = require("./superadmin.routes");
const adminRoutes = require("./admin.routes");
const lotteryRoutes = require("./lottery.routes");
const authadminRoutes = require("./authadmin.routes");
const masterRoutes = require("./master.routes");
const creditRoutes = require("./credit.routes");
const promotionRoutes = require("./promotion.routes");
const { authenticate } = require("../middleware/authadmin.middleware");
router.get("/check", (req, res) => {
  console.log("Response  check");
  res.status(200).json({
    status: 200,
    success: true,
    data: "Routes API v 1.0 is running",
  });
  return;
});

// ส่วน user
router.post("/login", authRoutes.login);
router.post("/refreshToken", authRoutes.refreshToken);
router.post("/logout", authRoutes.logout);
router.get("/profile/me", authenticate, authRoutes.getProfile);
router.use("/users", userRoutes);

// ส่วน admin
router.use("/superadmin", superadminRoutes);
router.use("/admin", adminRoutes);
router.use("/authadmin", authadminRoutes);
router.use("/master", masterRoutes);

// ส่วน lottery
router.use("/lottery", lotteryRoutes);

// ส่วนของ user lottery
router.use("/userlottery", userRoutes);

// ส่วนของการสร้าง credit
router.use("/credit", creditRoutes);

// ส่วนของการสร้าง promotion
router.use("/promotion", promotionRoutes);

module.exports = router;
