const express = require("express");
const router = express.Router();
const superadminController = require("../controller/superadmin/superadmin.controller");
const authmiddleware = require("../middleware/authadmin.middleware");

router.post(
  "/create",
  authmiddleware.permissionmanagersuperadmin,
  superadminController.createSuperadmin
);
router.get(
  "/get/",
  authmiddleware.permissionmanagersuperadmin,
  superadminController.getSuperadmin
);
router.get(
  "/getbyid/:id",
  authmiddleware.permissionmanagersuperadmin,
  superadminController.getSuperadminById
);
router.put(
  "/update/:id",
  
  superadminController.updateSuperadmin
);
router.delete(
  "/delete/:id",
  authmiddleware.permissionmanagersuperadmin,
  superadminController.deleteSuperadmin
);
// active superadmin
router.put(
  "/active/:id",
  authmiddleware.permissionmanagersuperadmin,
  superadminController.activesuperadmin
);
// disactive superadmin
router.put(
  "/disactive/:id",
  authmiddleware.permissionmanagersuperadmin,
  superadminController.disactivesuperadmin
);
module.exports = router;
