const express = require("express");
const router = express.Router();
const masterController = require("../controller/master/master.controller");
const authmiddleware = require("../middleware/authadmin.middleware");


router.post("/create", authmiddleware.permissionmanagermaster, masterController.createMaster);
router.get("/get", authmiddleware.permissionmanagermaster, masterController.getAllMasters);
router.get("/getbyid/:id", authmiddleware.permissionmanagermaster, masterController.getMasterById);
router.put("/update/:id", authmiddleware.permissionmanagermaster, masterController.updateMaster);
router.delete("/delete/:id", authmiddleware.permissionmanagermaster, masterController.deleteMaster);
router.put("/active/:id", authmiddleware.permissionmanagermaster, masterController.activateMaster);
router.put("/deactive/:id", authmiddleware.permissionmanagermaster, masterController.deactivateMaster);

module.exports = router;