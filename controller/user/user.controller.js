const authService = require("../../service/user/user.service");
const validate = require("../../validators/Validator");
const { logAction } = require("../../utils/logger");
const { normalizeIP } = require("../../utils/utils");

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
