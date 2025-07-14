const creditService = require("../../service/credit/credit.service");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

exports.createCredit = async function (req, res) {
  try {
    const { user_id, amount, channel, description ,addcredit_admin_id,addcredit_admin_name,addcredit_admin_role} = req.body;

    const credit = await creditService.createCredit({
      user_id,
      amount,
      channel,
      description,
      addcredit_admin_id,
      addcredit_admin_name,
      addcredit_admin_role,
    });
    if (!credit) {
      const response = await handleError(null, "Failed to create credit", 400);
      return res.status(response.status).json(response);
    }
    const response = await handleSuccess(credit, "Credit created successfully");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

exports.getCreditsByID = async function (req, res) {
  try {
    const { id } = req.params;
    const credits = await creditService.getCreditById(id);
    const response = await handleSuccess(
      credits,
      "Get credits by user successful"
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "Failed to get credits by user");
    return res.status(response.status).json(response);
  }
};

exports.getAllCredits = async function (req, res) {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query || {};

    const result = await creditService.getAllCredits({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      startDate,
      endDate,
    });

    const response = await handleSuccess(
      result.data,
      "Get all credits successful",
      200,
      result.pagination
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "Failed to get all credits");
    return res.status(response.status).json(response);
  }
};
 
exports.getCreditsByUserId = async function (req, res) {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 10, status } = req.query || {};

    const result = await creditService.getCreditsByUserId(user_id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
    });

    const response = await handleSuccess(
      result.data,
      "Get credits by user ID successful",
      200,
      result.pagination
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "Failed to get credits by user ID");
    return res.status(response.status).json(response);
  }
};

exports.updateCredit = async function (req, res) {
  try {
    const { id } = req.params;
    const { amount, channel, description } = req.body;
    const credit = await creditService.updateCredit({
      id,
      amount,
      channel,
      description,
    });
    if (!credit.success) {
      return res.status(credit.status).json(credit);
    }
    return res.status(credit.status).json(credit);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

exports.approveCredit = async function (req, res) {
  try {
    const { id } = req.params;
    const credit = await creditService.approveCredit({ id });
    if (!credit.success) {
      return res.status(credit.status).json(credit);
    }
    return res.status(credit.status).json(credit);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

exports.cancelCredit = async function (req, res) {
  try {
    const { id } = req.params;
    const credit = await creditService.cancelCredit({ id });
    if (!credit.success) {
      return res.status(credit.status).json(credit);
    }
    return res.status(credit.status).json(credit);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};

exports.deleteCredit = async function (req, res) {
  try {
    const { id } = req.params;
    const credit = await creditService.deleteCredit({ id });
    if (!credit.success) {
      return res.status(credit.status).json(credit);
    }
    return res.status(credit.status).json(credit);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};


// ยังไม่ใช้
exports.getCreditStats = async function (req, res) {
  try {
    const { id } = req.params;
    const stats = await creditService.getCreditStatsByUserId(id);

    const response = await handleSuccess(
      stats,
      "Credit stats fetched successfully"
    );

    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "Failed to fetch credit stats");
    return res.status(response.status).json(response);
  }
};

exports.getTopupDays = async function (req, res) {
  try {
    const { user_id, promotion_id } = req.query;

    if (!user_id || !promotion_id) {
      const response = await handleError(
        null,
        "user_id and promotion_id are required",
        400
      );
      return res.status(response.status).json(response);
    }

    const uniqueDaysCount = await creditService.getUniqueTopupDays(
      user_id,
      promotion_id
    );

    const response = await handleSuccess(
      { uniqueDaysCount },
      "Unique topup days fetched successfully"
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error);
    return res.status(response.status).json(response);
  }
};
