const express = require("express");
const router = express.Router();
const creditController = require("../controller/credit/credit.controller");

router.post("/create", creditController.createCredit);
router.get("/:id", creditController.getCreditsByID);
router.get("/get", creditController.getAllCredits);
router.get("/user/:id", creditController.getCreditStats); // Alias for getAllCredits
router.get("/days/check", creditController.getTopupDays);

module.exports = router;
