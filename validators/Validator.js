const Joi = require("joi");

exports.RegisterValidate = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(5).required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().min(10).max(15).required(),
    master_id: Joi.string().allow(null).optional(),
  });

  return schema.validate(data, { abortEarly: false });
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

  return schema.validate(data, { abortEarly: false });
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

  return schema.validate(data, { abortEarly: false });
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

  return schema.validate(data, { abortEarly: false });
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

  return schema.validate(data, { abortEarly: false });
};

exports.createBettingTypeSchema = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().label("Name").messages({
      "any.required": `"Name" is required.`,
      "string.empty": `"Name" cannot be empty.`,
    }),
    description: Joi.string().allow("", null).label("Description").messages({
      "string.base": `"Description" must be a string.`,
    }),
    code: Joi.string().allow("", null).label("Code"),
  });

  return schema.validate(data, { abortEarly: false });
};

exports.updateBettingTypeSchema = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().label("Name").messages({
      "any.required": `"Name" is required.`,
      "string.empty": `"Name" cannot be empty.`,
    }),
    description: Joi.string().required().label("Description").messages({
      "any.required": `"Description" is required.`,
      "string.empty": `"Description" cannot be empty.`,
    }),
    code: Joi.string().allow("", null).label("Code"),
  });

  return schema.validate(data, { abortEarly: false });
};

exports.validateCreateLotteryType = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "any.required": `"name" is required`,
      "string.empty": `"name" cannot be empty`,
    }),
    description: Joi.string().optional().allow("").messages({
      "string.base": `"description" must be a string`,
    }),
    slug: Joi.string().optional().allow("").messages({
      "string.base": `"description" must be a string`,
    }),
  });

  return schema.validate(data, { abortEarly: false });
};
