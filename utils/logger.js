const Log = require("../models/log.model");

exports.logAction = (action, { userId = null, endpoint = "", data = {} }) => {
  return Log.create({ action, userId, endpoint, data });
};
