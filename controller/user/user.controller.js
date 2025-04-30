const authService = require("../../service/user/user.service");
const validate = require("../../validators/Validator");

exports.register = async (req, res) => {
  try {
    const { error } = validate.RegisterValidate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await authService.registerUser(req.body);
    if (!user || user.error) {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: user ? user.error : "User registration failed",
      });
    }
    return res.status(201).json({
      code: 201,
      status: "success",
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      code: 500,
      message: "Internal server error",
      status: "error",
      error: err.message,
    });
  }
};
