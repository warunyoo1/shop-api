const { loginUser } = require("../../service/auth/auth.service");
const validate = require("../../validators/Validator");
const { logAction } = require("../../utils/logger");
const { normalizeIP } = require("../../utils/utils");

exports.login = async (req, res) => {
  const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
  const ip = normalizeIP(ipRaw);
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const referrer = req.get("Referer") || null;
  const { username, password } = req.body;

  try {
    const { error } = validate.loginValidate(req.body);
    if (error) {
      await logAction("login_failed_validation", {
        tag: "login",
        endpoint: fullUrl,
        ip,
        method: "POST",
        data: { error: error.details[0].message, input: req.body, referrer },
      });
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await loginUser(username, password);
    if (!result || result.error) {
      await logAction("login_failed", {
        tag: "login",
        endpoint: fullUrl,
        method: "POST",
        data: {
          error: result?.error || "Invalid login",
          input: req.body,
          referrer,
          ip,
        },
      });
      return res.status(401).json({
        code: 401,
        status: "error",
        message: result?.error || "Invalid credentials",
      });
    }

    const { user, token } = result;
    await logAction("login_success", {
      tag: "login",
      method: "POST",
      userId: user._id,
      endpoint: fullUrl,
      data: {
        user: { id: user._id, username: user.username, email: user.email },
        referrer,
        ip,
      },
    });

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Login successful",
      token,
    });
  } catch (err) {
    await logAction("login_error", {
      tag: "login",
      method: "POST",
      endpoint: fullUrl,
      data: { error: err.message, stack: err.stack, referrer, ip },
    });

    return res.status(500).json({
      code: 500,
      message: "Internal server error",
      status: "error",
      error: err.message,
    });
  }
};
