const validate = require("../../validators/Validator");
const { logAction } = require("../../utils/logger");
const { normalizeIP } = require("../../utils/utils");
const adminService = require("../../service/admin/admin.service");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

// create admin
exports.createAdmin = async (req, res) => {
  const userId = req.user?._id || null;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const referrer = req.get("Referer") || null;
  const body = req.body;
  try {
    const { error } = validate.adminValidate(body);
    if (error) {
      await logAction("create_admin_failed_validation", {
        tag: "create_admin",
        userId,
        fullUrl,
        ip,
        referrer,
        body,
      });
      const response = await handleError(error, error.details[0].message, 400);
      return res.status(response.status).json(response);
    }

    console.log(body);
    const result = await adminService.createAdmin(
      body.username,
      body.password,
      body.phone,
      body.role,
      body.premission
    );

    if (!result.success) {
      await logAction("create_admin_failed", {
        tag: "create_admin",
        userId,
        fullUrl,
        ip,
        referrer,
        body,
      });
      return res.status(result.status).json(result);
    }

    return res.status(result.status).json(result);
  } catch (err) {
    await logAction("create_admin_failed", {
      tag: "create_admin",
      userId,
      fullUrl,
      ip,
      referrer,
      body,
    });
    const response = await handleError(err);
    return res.status(response.status).json(response);
  }
};

// get admin
exports.getAdmin = async (req, res) => {
  const userId = req.user?._id || null;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const referrer = req.get("Referer") || null;

  try {
    const { page, perPage, search } = req.query;

    const result = await adminService.getadmin({
      page: parseInt(page) || 1,
      perPage: parseInt(perPage) || 10,
      search,
    });

    return res.status(result.status).json(result);
  } catch (err) {
    await logAction("get_admin_error", {
      tag: "get_admin",
      userId,
      fullUrl,
      ip,
      referrer,
      error: err.message,
    });
    const response = await handleError(err);
    return res.status(response.status).json(response);
  }
};

// get admin by id
exports.getAdminById = async (req, res) => {
  const userId = req.user?._id || null;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const referrer = req.get("Referer") || null;

  try {
    const { id } = req.params;
    if (!id) {
      // await logAction("get_admin_by_id_error", {
      //   tag: "get_admin_by_id",
      //   userId,
      //   fullUrl,
      //   ip,
      //   referrer,
      //   error: "ID is required",
      // });
      const response = await handleError(null, "กรุณาระบุ ID", 400);
      return res.status(response.status).json(response);
    }

    const result = await adminService.getadminById(id);
    return res.status(result.status).json(result);
  } catch (err) {
    await logAction("get_admin_by_id_error", {
      tag: "get_admin_by_id",
      userId,
      fullUrl,
      ip,
      referrer,
      error: err.message,
    });
    const response = await handleError(err);
    return res.status(response.status).json(response);
  }
};

// update admin
exports.updateAdmin = async (req, res) => {
  const userId = req.user?._id || null;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const referrer = req.get("Referer") || null;

  try {
    const { id } = req.params;
    const body = req.body;

    if (!id) {
      await logAction("update_admin_error", {
        tag: "update_admin",
        userId,
        fullUrl,
        ip,
        referrer,
        error: "ID is required",
      });
      const response = await handleError(null, "กรุณาระบุ ID", 400);
      return res.status(response.status).json(response);
    }

    const { error } = validate.adminValidate(body);
    if (error) {
      await logAction("update_admin_failed_validation", {
        tag: "update_admin",
        userId,
        fullUrl,
        ip,
        referrer,
        body,
      });
      const response = await handleError(error, error.details[0].message, 400);
      return res.status(response.status).json(response);
    }

    const result = await adminService.updateadmin(id, body, {
      user_id: req.user._id,
      role: req.user.role,
      full_name: req.user.username
    });
    return res.status(result.status).json(result);
  } catch (err) {
    await logAction("update_admin_error", {
      tag: "update_admin",
      userId,
      fullUrl,
      ip,
      referrer,
      error: err.message,
    });
    const response = await handleError(err);
    return res.status(response.status).json(response);
  }
};

// delete admin
exports.deleteAdmin = async (req, res) => {
  const userId = req.user?._id || null;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const referrer = req.get("Referer") || null;

  try {
    const { id } = req.params;
    if (!id) {
      await logAction("delete_admin_error", {
        tag: "delete_admin",
        userId,
        fullUrl,
        ip,
        referrer,
        error: "ID is required",
      });
      const response = await handleError(null, "กรุณาระบุ ID", 400);
      return res.status(response.status).json(response);
    }

    const result = await adminService.deleteadmin(id);
    return res.status(result.status).json(result);
  } catch (err) {
    await logAction("delete_admin_error", {
      tag: "delete_admin",
      userId,
      fullUrl,
      ip,
      referrer,
      error: err.message,
    });
    const response = await handleError(err);
    return res.status(response.status).json(response);
  }
};

// active admin
exports.activeadmin = async (req, res) => {
  const userId = req.user?._id || null;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const referrer = req.get("Referer") || null;

  try {
    const { id } = req.params;
    if (!id) {
      await logAction("active_admin_error", {
        tag: "active_admin",
        userId,
        endpoint: fullUrl,
        method: "PUT",
        data: { error: "Id is required", referrer, ip },
      });
      const response = await handleError(null, "กรุณาระบุ ID", 400);
      return res.status(response.status).json(response);
    }

    const result = await adminService.activeadmin(id);
    return res.status(result.status).json(result);
  } catch (error) {
    await logAction("active_admin_error", {
      tag: "active_admin",
      userId,
      endpoint: fullUrl,
      method: "PUT",
      data: { error: error.message, stack: error.stack, referrer, ip },
    });
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

// disactive admin
exports.disactiveadmin = async (req, res) => {
  const userId = req.user?._id || null;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const referrer = req.get("Referer") || null;

  try {
    const { id } = req.params;
    if (!id) {
      await logAction("disactive_admin_error", {
        tag: "disactive_admin",
        userId,
        endpoint: fullUrl,
        method: "PUT",
        data: { error: "Id is required", referrer, ip },
      });
      const response = await handleError(null, "กรุณาระบุ ID", 400);
      return res.status(response.status).json(response);
    }

    const result = await adminService.disactiveadmin(id);
    return res.status(result.status).json(result);
  } catch (error) {
    await logAction("disactive_admin_error", {
      tag: "disactive_admin",
      userId,
      endpoint: fullUrl,
      method: "PUT",
      data: { error: error.message, stack: error.stack, referrer, ip },
    });
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};
