const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin/admin.controller");
const authmiddleware = require("../middleware/authadmin.middleware");

router.post("/create", authmiddleware.isAdmin, adminController.createAdmin);
router.get("/get", authmiddleware.isAdmin, adminController.getAdmin);
router.get("/getbyid/:id", authmiddleware.isAdmin, adminController.getAdminById);
router.put("/update/:id", authmiddleware.isAdmin, adminController.updateAdmin);
router.delete("/delete/:id", authmiddleware.isAdmin, adminController.deleteAdmin);

// active admin
router.put("/active/:id", authmiddleware.isAdmin, adminController.activeadmin);
// disactive admin
router.put("/disactive/:id", authmiddleware.isAdmin, adminController.disactiveadmin);

module.exports = router;
