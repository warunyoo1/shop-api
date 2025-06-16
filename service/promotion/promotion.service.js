const Promotion = require('../../models/promotion.model');

exports.createPromotion = async function (promotionData) {
  const promotion = new Promotion(promotionData);
  return await promotion.save();
};

exports.getActivePromotions = async function () {
  const now = new Date();
  return await Promotion.find({
    active: true,
    $or: [
      { start_date: { $lte: now } },
      { start_date: null }
    ],
    $or: [
      { end_date: { $gte: now } },
      { end_date: null }
    ],
  });
};