const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin/admin.controller");
const authmiddleware = require("../middleware/authadmin.middleware");

router.post("/create", authmiddleware.permissionmanageradmin, adminController.createAdmin);
router.get("/get", authmiddleware.permissionmanageradmin, adminController.getAdmin);
router.get("/getbyid/:id", authmiddleware.permissionmanageradmin, adminController.getAdminById);
router.put("/update/:id", authmiddleware.permissionmanageradmin, adminController.updateAdmin);
router.delete("/delete/:id", authmiddleware.permissionmanageradmin, adminController.deleteAdmin);

// active admin
router.put("/active/:id", authmiddleware.permissionmanageradmin, adminController.activeadmin);
// disactive admin
router.put("/disactive/:id", authmiddleware.permissionmanageradmin, adminController.disactiveadmin);

module.exports = router;
