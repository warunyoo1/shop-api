const Log = require("../models/log.model");

exports.logAction = (
  action,
  {
    tag = null,
    userId = null,
    endpoint = "",
    data = {},
    ip = null,
    method = null,
  }
) => {
  const logData = { action, tag, userId, endpoint, data, ip, method };
  return Log.create(logData);
};
