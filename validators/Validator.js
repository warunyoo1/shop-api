const Joi = require("joi");

exports.RegisterValidate = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(5).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().min(10).max(15).required(),
    master_id: Joi.string().allow(null).optional(),
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

// vaild superadmin
exports.superadminValidate = (data) => {
  const schema = Joi.object({
    id: Joi.string().allow(null).optional().optional(),
    username: Joi.string().min(5).required(),
    email: Joi.string().email().required(),
    password: Joi.string().allow(null).optional(),
    phone: Joi.string().min(10).max(15).required(),
    address: Joi.string().allow(null).optional(),
  });

  return schema.validate(data);
};

// vaild admin
exports.adminValidate = (data) => {
  const schema = Joi.object({
    id: Joi.string().allow(null).optional().optional(),
    username: Joi.string().min(5).required(),
    email: Joi.string().email().required(),
    password: Joi.string().allow(null).optional(),
    phone: Joi.string().min(10).max(15).required(),
    address: Joi.string().allow(null).optional(),
    // เป็น array ห้ามว่าง
    role: Joi.array().required().min(1).messages({
      "array.base": "Role must be an array",
      "array.min": "Role must contain at least 1 item",
      "array.empty": "Role cannot be empty",
    }),
  });

  return schema.validate(data);
};

// vaild master
exports.masterValidate = (data) => {
  const schema = Joi.object({
    id: Joi.string().allow(null).optional().optional(),
    username: Joi.string().min(5).required(),
    email: Joi.string().email().required(),
    password: Joi.string().allow(null).optional(),
    phone: Joi.string().min(10).max(15).required(),
    commission_percentage: Joi.number().min(0).max(100).required(),
  });

  return schema.validate(data);
};

exports.createBettingTypeSchema  = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().label("Name"),
    description: Joi.string().required().label("Description"),
    code: Joi.string().allow("", null),
    lottery_type_id: Joi.string().required().label("Lottery Type ID"),
  });

  return schema.validate(data);
};


exports.updateBettingTypeSchema   = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().label("Name"),
    description: Joi.string().required().label("Description"),
    code: Joi.string().allow("", null),
  });

  return schema.validate(data);
};
