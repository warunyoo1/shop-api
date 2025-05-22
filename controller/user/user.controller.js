const authService = require("../../service/user/user.service");
const validate = require("../../validators/Validator");
const { logAction } = require("../../utils/logger");
const { normalizeIP } = require("../../utils/utils");
const userService = require('../../service/user/user.service');

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
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await authService.registerUser(body);
    if (!result || result.error) {
      await logAction("register_failed", {
        tag: "register",
        userId,
        endpoint: fullUrl,
        method: "POST",
        data: {
          error: result?.error || "User registration failed",
          input: body,
          referrer,
          ip,
        },
      });
      return res.status(400).json({
        code: 400,
        status: "error",
        message: result?.error || "User registration failed",
      });
    }

    const { user } = result;
    await logAction("register_success", {
      tag: "register",
      userId: user._id,
      endpoint: fullUrl,
      method: "POST",
      data: {
        user: { id: user._id, username: user.username, email: user.email, ip },
        referrer,
      },
    });

    return res.status(201).json({
      code: 201,
      status: "success",
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    await logAction("register_error", {
      tag: "register",
      userId,
      endpoint: fullUrl,
      method: "POST",
      data: { error: err.message, stack: err.stack, referrer },
    });

    return res.status(500).json({
      code: 500,
      message: "Internal server error",
      status: "error",
      error: err.message,
    });
  }
};
 
// get all user
exports.getAllUsers = async (req, res) => {
    try {
        const { page, perpage, search } = req.query;
        if (!page || !perpage) {
            return res.status(400).json({ error: "Page and perpage are required" });
        }
        const result = await userService.getuser({ page, perpage, search });
        
        if (result.error) {
            return res.status(400).json(result);
        }
        return res.status(200).json({
          status: "success",
          data: result.data,
          pagination: result.pagination
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// get user by id
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userService.getUserById(id);
        
        if (result.error) {
            return res.status(404).json(result);
        }
        
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

// update user
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const result = await userService.updateUser(id, updateData);
        
        if (result.error) {
            return res.status(400).json(result);
        }
        
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

// delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userService.deleteUser(id);
        
        if (result.error) {
            return res.status(404).json(result);
        }
        
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

// active user
exports.activeUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userService.activeUser(id);
        
        if (result.error) {
            return res.status(400).json(result);
        }
        
          return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};

// disactive user
exports.deactiveUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userService.deactiveUser(id);
        
        if (result.error) {
            return res.status(400).json(result);
        }
        
        return res.status(200).json({ status: "success", data: result });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};


