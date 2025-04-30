const Log = require("../models/log.model");

exports.logAction = (
  action,
  { tag = null, userId = null, endpoint = "", data = {} }
) => {
  return Log.create({ action, tag, userId, endpoint, data });
};
