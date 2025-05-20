    const express = require("express");
    const router = express.Router();
    const superadminController = require("../controller/superadmin/superadmin.controller");

    router.post("/create", superadminController.createSuperadmin);
    router.get("/get/", superadminController.getSuperadmin);
    router.get("/getbyid/:id", superadminController.getSuperadminById);
    router.put("/update/:id", superadminController.updateSuperadmin);
    router.delete("/delete/:id", superadminController.deleteSuperadmin);

    module.exports = router;