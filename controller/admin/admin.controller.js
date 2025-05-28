const validate = require("../../validators/Validator");
const { logAction } = require("../../utils/logger");
const { normalizeIP } = require("../../utils/utils");
const adminService = require("../../service/admin/admin.service");

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
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }

    const result = await adminService.createAdmin(
      body.username,
      body.email,
      body.password,
      body.phone,
      body.address,
      body.role
    );

    if (result.error) {
      await logAction("create_admin_failed", {
        tag: "create_admin",
        userId,
        fullUrl,
        ip,
        referrer,
        body,
      });
      return res.status(400).json({
        status: "error",
        message: result.error,
      });
    }

    // await logAction("create_admin_success", {
    //     tag: "create_admin",
    //     userId,
    //     fullUrl,
    //     ip,
    //     referrer,
    //     data: result.data
    // });

    return res.status(201).json({
      status: "success",
      message: "สร้าง admin สำเร็จ",
      data: result.data,
    });
  } catch (err) {
    await logAction("create_admin_failed", {
      tag: "create_admin",
      userId,
      fullUrl,
      ip,
      referrer,
      body,
    });
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
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

    // await logAction("get_admin_success", {
    //     tag: "get_admin",
    //     userId,
    //     fullUrl,
    //     ip,
    //     referrer,
    //     query: req.query
    // });

    return res.status(200).json({
      status: "success",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    await logAction("get_admin_error", {
      tag: "get_admin",
      userId,
      fullUrl,
      ip,
      referrer,
      error: err.message,
    });
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
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
      await logAction("get_admin_by_id_error", {
        tag: "get_admin_by_id",
        userId,
        fullUrl,
        ip,
        referrer,
        error: "ID is required",
      });
      return res.status(400).json({
        status: "error",
        message: "กรุณาระบุ ID",
      });
    }

    const result = await adminService.getadminById(id);
    if (result.error) {
      await logAction("get_admin_by_id_error", {
        tag: "get_admin_by_id",
        userId,
        fullUrl,
        ip,
        referrer,
        error: result.error,
      });
      return res.status(404).json({
        status: "error",
        message: result.error,
      });
    }

    // await logAction("get_admin_by_id_success", {
    //     tag: "get_admin_by_id",
    //     userId,
    //     fullUrl,
    //     ip,
    //     referrer,
    //     id
    // });

    return res.status(200).json({
      status: "success",
      data: result.data,
    });
  } catch (err) {
    await logAction("get_admin_by_id_error", {
      tag: "get_admin_by_id",
      userId,
      fullUrl,
      ip,
      referrer,
      error: err.message,
    });
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
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
      return res.status(400).json({
        status: "error",
        message: "กรุณาระบุ ID",
      });
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
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }

    const result = await adminService.updateadmin(id, body);
    if (result.error) {
      await logAction("update_admin_failed", {
        tag: "update_admin",
        userId,
        fullUrl,
        ip,
        referrer,
        body,
      });
      return res.status(400).json({
        status: "error",
        message: result.error,
      });
    }

    // await logAction("update_admin_success", {
    //     tag: "update_admin",
    //     userId,
    //     fullUrl,
    //     ip,
    //     referrer,
    //     data: result.data
    // });

    return res.status(200).json({
      status: "success",
      message: "อัพเดท admin สำเร็จ",
      data: result.data,
    });
  } catch (err) {
    await logAction("update_admin_error", {
      tag: "update_admin",
      userId,
      fullUrl,
      ip,
      referrer,
      error: err.message,
    });
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
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
      return res.status(400).json({
        status: "error",
        message: "กรุณาระบุ ID",
      });
    }

    const result = await adminService.deleteadmin(id);
    if (result.error) {
      await logAction("delete_admin_failed", {
        tag: "delete_admin",
        userId,
        fullUrl,
        ip,
        referrer,
        error: result.error,
      });
      return res.status(400).json({
        status: "error",
        message: result.error,
      });
    }

    // await logAction("delete_admin_success", {
    //     tag: "delete_admin",
    //     userId,
    //     fullUrl,
    //     ip,
    //     referrer,
    //     id
    // });

    return res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (err) {
    await logAction("delete_admin_error", {
      tag: "delete_admin",
      userId,
      fullUrl,
      ip,
      referrer,
      error: err.message,
    });
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
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
      return res.status(400).json({
        code: 400,
        status: "error",
        message: "Id is required",
      });
    }

    const result = await adminService.activeadmin(id);
    if (result.error) {
      await logAction("active_admin_error", {
        tag: "active_admin",
        userId,
        endpoint: fullUrl,
        method: "PUT",
        data: { error: result.error, referrer, ip },
      });
      return res.status(400).json({
        code: 400,
        status: "error",
        message: result.error,
      });
    }

    await logAction("active_admin_success", {
      tag: "active_admin",
      userId,
      endpoint: fullUrl,
      method: "PUT",
      data: { adminId: id, referrer, ip },
    });

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "อัพเดทสถานะ admin เป็น active สำเร็จ",
      data: result.data,
    });
  } catch (error) {
    await logAction("active_admin_error", {
      tag: "active_admin",
      userId,
      endpoint: fullUrl,
      method: "PUT",
      data: { error: error.message, stack: error.stack, referrer, ip },
    });
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
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
      return res.status(400).json({
        code: 400,
        status: "error",
        message: "Id is required",
      });
    }

    const result = await adminService.disactiveadmin(id);
    if (result.error) {
      await logAction("disactive_admin_error", {
        tag: "disactive_admin",
        userId,
        endpoint: fullUrl,
        method: "PUT",
        data: { error: result.error, referrer, ip },
      });
      return res.status(400).json({
        code: 400,
        status: "error",
        message: result.error,
      });
    }

    await logAction("disactive_admin_success", {
      tag: "disactive_admin",
      userId,
      endpoint: fullUrl,
      method: "PUT",
      data: { adminId: id, referrer, ip },
    });

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "อัพเดทสถานะ admin เป็น inactive สำเร็จ",
      data: result.data,
    });
  } catch (error) {
    await logAction("disactive_admin_error", {
      tag: "disactive_admin",
      userId,
      endpoint: fullUrl,
      method: "PUT",
      data: { error: error.message, stack: error.stack, referrer, ip },
    });
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};
