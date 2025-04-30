const Joi = require("joi");

exports.RegisterValidate = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(5).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().min(10).max(15).required(),
  });

  return schema.validate(data);
};

exports.loginValidate = (data) => {
  const schema = Joi.object({
    username: Joi.string().required().messages({
      "string.empty": "Username is required",
    }),
    password: Joi.string().min(6).required().messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
    }),
  });

  return schema.validate(data);
};
