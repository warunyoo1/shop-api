const authService = require("../../service/user/user.service");
const Master = require("../../models/master.model");
const validate = require("../../validators/Validator");
const { logAction } = require("../../utils/logger");
const { normalizeIP } = require("../../utils/utils");
const userService = require("../../service/user/user.service");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

exports.register = async (req, res) => {
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
    const { error } = validate.RegisterValidate(body);
    if (error) {
      await logAction("register_failed_validation", {
        tag: "register",
        userId,
        endpoint: fullUrl,
        method: "POST",
        data: { error: error.details[0].message, input: body, referrer, ip },
      });
      const response = await handleError(error, error.details[0].message, 400);
      return res.status(response.status).json(response);
    }

    let master_id = null;
    if (body.master_id) {
      const usernameFromUrl = body.master_id.trim().split("/").pop();
      const master = await Master.findOne({ username: usernameFromUrl });

      if (!master) {
        const response = await handleError(
          null,
          "ไม่พบ Master จาก username ที่ระบุ",
          404
        );
        return res.status(response.status).json(response);
      }
      master_id = master._id;
      body.master_id = master_id;
    }

    const result = await authService.registerUser({
      ...body,
      master_id,
    });

    if (!result.success) {
      await logAction("register_failed", {
        tag: "register",
        userId,
        endpoint: fullUrl,
        method: "POST",
        data: {
          error: result.error || "User registration failed",
          input: body,
          referrer,
          ip,
        },
      });
      return res.status(result.status).json(result);
    }

    await logAction("register_success", {
      tag: "register",
      userId: result.data._id,
      endpoint: fullUrl,
      method: "POST",
      data: {
        user: {
          id: result.data._id,
          username: result.data.username,

        },
        ip,
        referrer,
      },
    });

    return res.status(result.status).json(result);
  } catch (error) {
    await logAction("register_error", {
      tag: "register",
      userId,
      endpoint: fullUrl,
      method: "POST",
      data: { error: error.message, stack: error.stack, referrer },
    });

    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

// get all user
exports.getAllUsers = async (req, res) => {
  try {
    const { page, perpage, search } = req.query;
    if (!page || !perpage) {
      const response = await handleError(
        null,
        "กรุณาระบุ page และ perpage",
        400
      );
      return res.status(response.status).json(response);
    }

    const result = await userService.getuser({ page, perpage, search });
    return res.status(result.status).json(result);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

// get user by id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response = await handleError(null, "กรุณาระบุ ID", 400);
      return res.status(response.status).json(response);
    }

    const result = await userService.getUserById(id);
    return res.status(result.status).json(result);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

// update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response = await handleError(null, "กรุณาระบุ ID", 400);
      return res.status(response.status).json(response);
    }

    const result = await userService.updateUser(id, req.body, {
      user_id: req.user._id,
      role: req.user.role,
      full_name: req.user.username
    });
    
    return res.status(result.status).json(result);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

// delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response = await handleError(null, "กรุณาระบุ ID", 400);
      return res.status(response.status).json(response);
    }

    const result = await userService.deleteUser(id);
    return res.status(result.status).json(result);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

// active user
exports.activeUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response = await handleError(null, "กรุณาระบุ ID", 400);
      return res.status(response.status).json(response);
    }

    const result = await userService.activeUser(id);
    return res.status(result.status).json(result);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

// disactive user
exports.deactiveUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response = await handleError(null, "กรุณาระบุ ID", 400);
      return res.status(response.status).json(response);
    }

    const result = await userService.deactiveUser(id);
    return res.status(result.status).json(result);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};
