const Promotion = require("../../models/promotion.model");

exports.createPromotion = async function (promotionData) {
  const promotion = new Promotion(promotionData);
  return await promotion.save();
};

exports.getActivePromotions = async function () {
  const now = new Date();
  return await Promotion.find({
    active: true,
    $or: [{ start_date: { $lte: now } }, { start_date: null }],
    $or: [{ end_date: { $gte: now } }, { end_date: null }],
  });
};

exports.getPromotionById = async function (promotionId) {
  return await Promotion.findById(promotionId);
};

exports.getAllPromotions = async function ({ page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;
  const total = await Promotion.countDocuments();
  const promotions = await Promotion.find()
    .skip(skip)
    .limit(limit)
    .sort({ created_at: -1 });

  return {
    data: promotions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
