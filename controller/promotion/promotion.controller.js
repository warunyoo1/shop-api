const promotionService = require("../../service/promotion/promotion.service");
const {
  handleSuccess,
  handleError,
  handleSuccessResetResponse,
} = require("../../utils/responseHandler");
const { isValidObjectId } = require("../../utils/utils");
require("dotenv").config();

exports.createPromotion = async (req, res) => {
  try {
    const promotion = await promotionService.createPromotion(req.body);
    const response = await handleSuccessResetResponse(
      promotion,
      "Promotion created successfully"
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "Failed to create promotion");
    return res.status(response.status).json(response);
  }
};

exports.createPromotionByUserID = async (req, res) => {
  try {
    const promotion = await promotionService.createPromotionByUserID(req.body);
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

exports.getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      const response = await handleError(
        "Invalid ObjectId",
        "Invalid promotion ID format",
        400
      );
      return res.status(400).json(response);
    }

    const promotion = await promotionService.getPromotionById(id);

    if (!promotion) {
      const response = await handleError(null, "Promotion not found", 404);
      return res.status(404).json(response);
    }

    const response = await handleSuccess(
      promotion,
      "Promotion retrieved successfully",
      200
    );
    return res.status(200).json(response);
  } catch (error) {
    const response = await handleError(
      error,
      "Failed to get promotion by ID",
      500
    );
    return res.status(500).json(response);
  }
};

exports.getAllPromotions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query || {};
    const result = await promotionService.getAllPromotions({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    const response = await handleSuccess(
      result.data,
      "ดึงข้อมูลโปรโมชั่นทั้งหมดสำเร็จ",
      200,
      result.pagination
    );
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(error, "Failed to get all promotions");
    return res.status(response.status).json(response);
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "Please upload an image" });
    }

    const file = req.files.image;

    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "File must be an image" });
    }

    const MAX_SIZE = parseInt(process.env.MAX_IMAGE_SIZE) || 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return res.status(400).json({
        error: `Image size must not exceed ${MAX_SIZE / 1024 / 1024}MB`,
      });
    }

    const promotionId = req.params.id;
    const { description } = req.body;

    const result = await promotionService.uploadService(
      file,
      promotionId,
      description,
      req
    );

    res.json({
      success: true,
      message: "Image uploaded successfully",
      file: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
