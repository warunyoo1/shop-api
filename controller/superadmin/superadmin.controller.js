const validate = require("../../validators/Validator");
const superadminService = require("../../service/superadmin/superadmin.service");
const { logAction } = require("../../utils/logger");
const { normalizeIP } = require("../../utils/utils");
//create superadmin 
exports.createSuperadmin = async (req, res) => {
    const userId = req.user?._id || null;
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const ipRaw = req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
    const ip = normalizeIP(ipRaw);
    const referrer = req.get("Referer") || null;
    const body = req.body;

    try{
        const {error} = validate.superadminValidate(body);
        if(error){
            await logAction("create_superadmin_failed_validation", {
                tag: "create_superadmin",
                userId,
                endpoint: fullUrl,
                method: "POST",
                data: { error: error.details[0].message, input: body, referrer, ip },
              });
            
            return res.status(400).json({code: 400, status: "error", message: error.details[0].message || "Validation superadmin failed"});
        }

        const result = await superadminService.createSuperadmin(body);
        if(!result || result.error){
            await logAction("create_superadmin_failed", {
                tag: "create_superadmin",
                userId,
                endpoint: fullUrl,
                method: "POST",
                data: { error: result.error, input: body, referrer, ip },
            });
            return res.status(400).json({code: 400, status: "error", message: result.error || "Create superadmin failed"});
        }

        const {superadmin} = result;
        // await logAction("create_superadmin_success", {
        //     tag: "create_superadmin",
        //     userId,
        //     endpoint: fullUrl,
        //     method: "POST",
        //     data: { superadmin, referrer, ip },
        // });

        return res.status(201).json({
            code: 201,
            status: "success",
            message: "Superadmin created successfully",
            superadmin,
        });
    }catch(err){
        await logAction("create_superadmin_error", {
            tag: "create_superadmin",
            userId,
            endpoint: fullUrl,
            method: "POST",
            data: { error: err.message, stack: err.stack, referrer, ip },
        });
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Internal server error",
            error: err.message,
        });
    }

};

//get superadmin
exports.getSuperadmin = async (req, res) => {
    const userId = req.user?._id || null;
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const ipRaw = req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
    const ip = normalizeIP(ipRaw);
    const referrer = req.get("Referer") || null;
   
    try {
        const { page, perpage, search } = req.query;
        if(!page || !perpage){
            return res.status(400).json({code: 400, status: "error", message: "Page and perpage are required"});
        }
        
        const result = await superadminService.getSuperadmin({
            page: parseInt(page) || 1,
            perpage: parseInt(perpage) || 10,
            search
        });

        // await logAction("get_superadmin_success", {
        //     tag: "get_superadmin",
        //     userId,
        //     endpoint: fullUrl,
        //     method: "GET",
        //     data: { query: req.query, referrer, ip },
        // });

        return res.status(200).json({
            code: 200,
            status: "success",
            data: result.data,
            pagination: result.pagination
        });

    } catch(err) {
        await logAction("get_superadmin_error", {
            tag: "get_superadmin",
            userId,
            endpoint: fullUrl,
            method: "GET",
            data: { error: err.message, stack: err.stack, referrer, ip },
        });
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Internal server error",
            error: err.message,
        });
    }
};
//get superadmin by id
exports.getSuperadminById = async (req, res) => {
    const userId = req.user?._id || null;
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const ipRaw = req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
    const ip = normalizeIP(ipRaw);
    const referrer = req.get("Referer") || null;
    try{
      const id = req.params.id;
      if(!id){
        await logAction("get_superadmin_by_id_error", {
            tag: "get_superadmin_by_id",
            userId,
            endpoint: fullUrl,
            method: "GET",
            data: { error: "Id is required", referrer, ip },
        });
        return res.status(400).json({code: 400, status: "error", message: "Id is required"});
      }

      const result = await superadminService.getSuperadminById(id);
      if(!result || result.error){
        await logAction("get_superadmin_by_id_error", {
            tag: "get_superadmin_by_id",
            userId,
            endpoint: fullUrl,
        });
        return res.status(400).json({code: 400, status: "error", message: result.error || "Get superadmin by id failed"});
      }

    //   await logAction("get_superadmin_by_id_success", {
    //     tag: "get_superadmin_by_id",
    //     userId,
    //     endpoint: fullUrl,
    //   });

      return res.status(200).json({
        code: 200,
        status: "success",
        data: result.data,
      });
    }catch(err){
        await logAction("get_superadmin_by_id_error", {
            tag: "get_superadmin_by_id",
            userId,
            endpoint: fullUrl,
        });
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Internal server error",
            error: err.message,
        });
    }

};

//update superadmin
exports.updateSuperadmin = async (req, res) => {
    const userId = req.user?._id || null;
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const ipRaw = req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
    const ip = normalizeIP(ipRaw);
    const referrer = req.originalUrl;
    const id = req.params.id;
    const body = req.body;

    try{
        const {error} = validate.superadminValidate(body);
        if(error){
            await logAction("update_superadmin_failed_validation", {
                tag: "update_superadmin",
                userId,
                endpoint: fullUrl,
            });
        }
        const result = await superadminService.updateSuperadmin(id, body);
        if(!result || result.error){
            await logAction("update_superadmin_failed", {
                tag: "update_superadmin",
                userId,
                endpoint: fullUrl,
            });
            return res.status(400).json({code: 400, status: "error", message: result.error || "Update superadmin failed"});
        }

        await logAction("update_superadmin_success", {
            tag: "update_superadmin",
            userId,
            endpoint: fullUrl,
        });

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Superadmin updated successfully",
            data: result.data,
        });
    }catch(err){
        await logAction("update_superadmin_error", {
            tag: "update_superadmin",
            userId,
            endpoint: fullUrl,
        });
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Internal server error",
            error: err.message,
        });
    }

}

//delete superadmin
exports.deleteSuperadmin = async (req, res) => {
    const userId = req.user?._id || null;
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const ipRaw = req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
    const ip = normalizeIP(ipRaw);
    const referrer = req.originalUrl;
    const id = req.params.id;

    try{
        if(!id){
            await logAction("delete_superadmin_error", {
                tag: "delete_superadmin",
                userId,
                endpoint: fullUrl,
            });
            return res.status(400).json({code: 400, status: "error", message: "Id is required"});
        }

        const result = await superadminService.deleteSuperadmin(id);
        if(!result || result.error){
            await logAction("delete_superadmin_error", {
                tag: "delete_superadmin",
                userId,
                endpoint: fullUrl,
            });
            return res.status(400).json({code: 400, status: "error", message: result.error || "Delete superadmin failed"});
        }

        await logAction("delete_superadmin_success", {
            tag: "delete_superadmin",
            userId,
            endpoint: fullUrl,
        });

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Superadmin deleted successfully",
        });
    }catch(err){
        await logAction("delete_superadmin_error", {
            tag: "delete_superadmin",
            userId,
            endpoint: fullUrl,
        });
        return res.status(500).json({
            code: 500,
            status: "error",
            message: "Internal server error",
            error: err.message,
        });
    }
}