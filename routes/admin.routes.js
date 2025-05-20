const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin/admin.controller");

router.post("/create", adminController.createAdmin);
router.get("/get", adminController.getAdmin);
router.get("/getbyid/:id", adminController.getAdminById);
router.put("/update/:id", adminController.updateAdmin);
router.delete("/delete/:id", adminController.deleteAdmin);

module.exports = router;
