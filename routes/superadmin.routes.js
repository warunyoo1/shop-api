    const express = require("express");
    const router = express.Router();
    const superadminController = require("../controller/superadmin/superadmin.controller");
    const authmiddleware = require("../middleware/authadmin.middleware");

    router.post("/create", authmiddleware.isAdmin, superadminController.createSuperadmin);
    router.get("/get/", authmiddleware.isAdmin, superadminController.getSuperadmin);
    router.get("/getbyid/:id", authmiddleware.isAdmin, superadminController.getSuperadminById);
    router.put("/update/:id", authmiddleware.isAdmin, superadminController.updateSuperadmin);
    router.delete("/delete/:id", authmiddleware.isAdmin, superadminController.deleteSuperadmin);

    module.exports = router; 