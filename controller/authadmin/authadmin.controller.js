const validate = require("../../validators/Validator");
const { logAction } = require("../../utils/logger");
const { normalizeIP } = require("../../utils/utils");
const authadminService = require("../../service/authadmin/authadmin.service");

 
exports.login = async (req, res) => {
    const ipRaw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip;
    const ip = normalizeIP(ipRaw);
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const referrer = req.get("Referer") || null;
    const userAgent = req.get("User-Agent");
    const { username, password } = req.body;

    try{
        const {error} = validate.loginValidate(req.body);
        if (error) {
            await logAction("login_admin_failed_validation", {
              tag: "login",
              endpoint: fullUrl,
              ip,
              method: "POST",
              data: { error: error.details[0].message, input: req.body, referrer },
            });
            return res.status(400).json({ error: error.details[0].message });
          }
           
          const result = await authadminService.loginadmin(username, password, ip, userAgent);
          if (result.success === false) {
            await logAction("login_admin_failed", {
                tag: "login",
                endpoint: fullUrl,
                method: "POST",
                data: {
                  error: result.message,
                  input: req.body,
                  referrer,
                  ip,
                },
              });
              return res.status(400).json({
                code: 400,
                status: "error",
                message: result.message,
              });
          }


          if (!result || result.error) {
            await logAction("login_admin_failed", {
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

          const {user, token, refreshToken} = result;
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
            refreshToken,
          });

    }catch(err){
        await logAction("login_admin_error", {
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


exports.refreshToken = async (req, res) => {
    const authorizationHeader = req.headers["authorization"];
   
    if (!authorizationHeader)
      return res.status(400).json({ error: "Missing authorization header" });

    const token = authorizationHeader.split(" ")[1];
    if (!token) return res.status(400).json({ error: "Missing token" });
    try {
      const result = await authadminService.handleRefreshToken(token);
      return res.status(200).json({ token: result});
    } catch (err) {
        return res.status(403).json({ error: err.message || "Invalid or expired token" });
    }
    
};


exports.logout = async (req, res) => {
    const authorizationHeader = req.headers["authorization"];
    if (!authorizationHeader)
      return res.status(400).json({ error: "Missing authorization header" });
  
    const token = authorizationHeader.split(" ")[1];
    if (!token) return res.status(400).json({ error: "Missing token" });
  
    try {
      const result = await authadminService.logout(token);
      return res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }

};


