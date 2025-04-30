// routes/index.js
const express = require("express");
const router = express.Router();
const userRoutes = require("./user.routes");
const authRoutes = require("../controller/auth/auth.controller");

router.get("/check", (req, res) => {
  console.log("Response  check");
  res.status(200).json({
    status: 200,
    success: true,
    data: "Routes API v 1.0 is running",
  });
  return;
});

router.post("/login", authRoutes.login);
router.use("/users", userRoutes);

module.exports = router;
