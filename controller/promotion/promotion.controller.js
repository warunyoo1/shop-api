const promotionService = require("../../service/promotion/promotion.service");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

exports.createPromotion = async (req, res) => {
  try {
    const promotion = await promotionService.createPromotion(req.body);
    const response = await handleSuccess(
      promotion,
      "Promotion created successfully"
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "Failed to create promotion");
    return res.status(response.status).json(response);
  }
};
