// routes/index.js
const express = require("express");
const router = express.Router();
const userRoutes = require("./user.routes");
const authRoutes = require("../controller/auth/auth.controller");
const superadminRoutes = require("./superadmin.routes");
const adminRoutes = require("./admin.routes");

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
router.use("/users", userRoutes);


// ส่วน admin
router.use("/superadmin", superadminRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
