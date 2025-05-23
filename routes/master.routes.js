const express = require("express");
const router = express.Router();
const masterController = require("../controller/master/master.controller");
const authmiddleware = require("../middleware/authadmin.middleware");

router.post("/create", authmiddleware.isMaster, masterController.createMaster);
router.get("/get", authmiddleware.isMaster, masterController.getAllMasters);
router.get("/getbyid/:id", authmiddleware.isMaster, masterController.getMasterById);
router.put("/update/:id", authmiddleware.isMaster, masterController.updateMaster);
router.delete("/delete/:id", authmiddleware.isMaster, masterController.deleteMaster);
router.put("/active/:id", authmiddleware.isMaster, masterController.activateMaster);
router.put("/deactive/:id", authmiddleware.isMaster, masterController.deactivateMaster);

module.exports = router;