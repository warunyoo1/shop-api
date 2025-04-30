const Log = require("../models/log.model");

exports.logAction = (
  action,
  { tag = null, userId = null, endpoint = "", data = {}, ip = null }
) => {
    const logData = { action, tag, userId, endpoint, data, ip };
    return Log.create(logData);
};
