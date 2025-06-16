const creditService = require("../../service/credit/credit.service");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

exports.createCredit = async function (req, res) {
  try {
    const { user_id, amount, type, description, promotion_id } = req.body;
    const credit = await creditService.createCredit({
      user_id,
      amount,
      type,
      description,
      promotion_id,
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
    const { page = 1, limit = 10 } = req.query || {};

    const result = await creditService.getAllCredits({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
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
