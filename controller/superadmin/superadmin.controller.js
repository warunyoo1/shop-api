const validate = require("../../validators/Validator");
const superadminService = require("../../service/superadmin/superadmin.service");
const { logAction } = require("../../utils/logger");
const { normalizeIP } = require("../../utils/utils");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

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
            
            const response = await handleError(error, error.details[0].message || "Validation superadmin failed", 400);
            return res.status(response.status).json(response);
        }

        const result = await superadminService.createSuperadmin(body);
        if(!result.success){
            await logAction("create_superadmin_failed", {
                tag: "create_superadmin",
                userId,
                endpoint: fullUrl,
                method: "POST",
                data: { error: result.error, input: body, referrer, ip },
            });
            return res.status(result.status).json(result);
        }

        return res.status(result.status).json(result);
    }catch(err){
        await logAction("create_superadmin_error", {
            tag: "create_superadmin",
            userId,
            endpoint: fullUrl,
            method: "POST",
            data: { error: err.message, stack: err.stack, referrer, ip },
        });
        const response = await handleError(err);
        return res.status(response.status).json(response);
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
            const response = await handleError(null, "Page and perpage are required", 400);
            return res.status(response.status).json(response);
        }
       
        const result = await superadminService.getSuperadmin({
            page: parseInt(page) || 1,
            perpage: parseInt(perpage) || 10,
            search
        });
        

        return res.status(result.status).json(result);
    } catch(err) {
        await logAction("get_superadmin_error", {
            tag: "get_superadmin",
            userId,
            endpoint: fullUrl,
            method: "GET",
            data: { error: err.message, stack: err.stack, referrer, ip },
        });
        const response = await handleError(err);
        return res.status(response.status).json(response);
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
            // await logAction("get_superadmin_by_id_error", {
            //     tag: "get_superadmin_by_id",
            //     userId,
            //     endpoint: fullUrl,
            //     method: "GET",
            //     data: { error: "Id is required", referrer, ip },
            // });
            const response = await handleError(null, "Id is required", 400);
            return res.status(response.status).json(response);
        }

        const result = await superadminService.getSuperadminById(id);
        return res.status(result.status).json(result);
    }catch(err){
        await logAction("get_superadmin_by_id_error", {
            tag: "get_superadmin_by_id",
            userId,
            endpoint: fullUrl,
            method: "GET",
            data: { error: err.message, stack: err.stack, referrer, ip },
        });
        const response = await handleError(err);
        return res.status(response.status).json(response);
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
                method: "PUT",
                data: { error: error.details[0].message, input: body, referrer, ip },
            });
            const response = await handleError(error, error.details[0].message || "Validation superadmin failed", 400);
            return res.status(response.status).json(response);
        }

        const result = await superadminService.updateSuperadmin(id, body, {
            user_id: req.user._id,
            role: req.user.role,
            full_name: req.user.username
        });
        return res.status(result.status).json(result);
    }catch(err){
        await logAction("update_superadmin_error", {
            tag: "update_superadmin",
            userId,
            endpoint: fullUrl,
            method: "PUT",
            data: { error: err.message, stack: err.stack, referrer, ip },
        });
        const response = await handleError(err);
        return res.status(response.status).json(response);
    }
};

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
                method: "DELETE",
                data: { error: "Id is required", referrer, ip },
            });
            const response = await handleError(null, "Id is required", 400);
            return res.status(response.status).json(response);
        }

        const result = await superadminService.deleteSuperadmin(id);
        return res.status(result.status).json(result);
    }catch(err){
        await logAction("delete_superadmin_error", {
            tag: "delete_superadmin",
            userId,
            endpoint: fullUrl,
            method: "DELETE",
            data: { error: err.message, stack: err.stack, referrer, ip },
        });
        const response = await handleError(err);
        return res.status(response.status).json(response);
    }
};

// active superadmin
exports.activesuperadmin = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            const response = await handleError(null, "Id is required", 400);
            return res.status(response.status).json(response);
        }

        const result = await superadminService.activesuperadmin(id);
        return res.status(result.status).json(result);
    } catch (error) {
        const response = await handleError(error);
        return res.status(response.status).json(response);
    }
};

// disactive superadmin
exports.disactivesuperadmin = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            const response = await handleError(null, "Id is required", 400);
            return res.status(response.status).json(response);
        }

        const result = await superadminService.disactivesuperadmin(id);
        return res.status(result.status).json(result);
    } catch (error) {
        const response = await handleError(error);
        return res.status(response.status).json(response);
    }
};