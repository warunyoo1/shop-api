const Joi = require("joi");

const RegisterValidate = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(5).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().min(10).max(15).required(),
  });

  return schema.validate(data);
};

module.exports = { RegisterValidate };
