const Promotion = require("../../models/promotion.model");
const User = require("../../models/user.model");

exports.createPromotion = async function (promotionData) {
  try {
    const existing = await Promotion.findOne({
      type: promotionData.type,
      active: true,
    });

    if (existing) {
      const error = new Error(
        `Promotion type '${promotionData.type}' already exists and is active`
      );
      error.statusCode = 400;
      throw error;
    }

    const promotion = new Promotion(promotionData);
    return await promotion.save();
  } catch (error) {
    throw error;
  }
};

exports.createPromotionByUserID = async function (promotionData) {
  try {
    const { allowed_user_ids = [] } = promotionData;

    const validUsers = await User.find({
      _id: { $in: allowed_user_ids },
    });

    const validUserIds = validUsers.map((user) => user._id.toString());

    const invalidUserIds = allowed_user_ids.filter(
      (id) => !validUserIds.includes(id.toString())
    );

    if (invalidUserIds.length > 0) {
      const error = new Error(`Invalid user IDs: ${invalidUserIds.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }

    const promotion = new Promotion(promotionData);
    return await promotion.save();
  } catch (error) {
    console.error("❌ Error in createPromotionByUserID:", error.message);
    throw error;
  }
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
