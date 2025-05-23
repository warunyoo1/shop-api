const express = require("express");
const router = express.Router();
const authadminController = require("../controller/authadmin/authadmin.controller");


router.post("/login", authadminController.login);
router.post("/refresh-token", authadminController.refreshToken);
router.post("/logout", authadminController.logout);
router.post("/login-master", authadminController.loginMaster);


module.exports = router;