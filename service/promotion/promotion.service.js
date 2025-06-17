const mongoose = require("mongoose");
const Promotion = require("../../models/promotion.model");
const User = require("../../models/user.model");
const UserPromotion = require("../../models/userPromotions.models");

exports.createPromotion = async function (promotionData) {
  try {
    // 1. สร้างโปรโมชั่นใหม่
    const promotion = new Promotion(promotionData);
    const savedPromotion = await promotion.save();
    console.log("✅ Promotion created:", savedPromotion);

    let userFilter = {};
    switch (promotionData.target) {
      case "master":
        userFilter = { master_id: { $ne: null } };
        break;
      case "referrer":
        userFilter = { referral_by: { $ne: null } };
        break;
      case "normal":
        userFilter = {
          referral_by: null,
          master_id: null,
        };
        break;
      default:
        throw new Error(`Invalid target type: ${promotionData.target}`);
    }

    const targetUsers = await User.find(userFilter);
    const userPromotions = targetUsers.map((user) => ({
      user_id: user._id,
      promotion_id: savedPromotion._id,
      status: "pending",
    }));

    if (userPromotions.length > 0) {
      await UserPromotion.insertMany(userPromotions);
      console.log(`✅ Created ${userPromotions.length} UserPromotion records.`);
    } else {
      console.log("ℹ️ No users matched target criteria.");
    }

    return savedPromotion;
  } catch (error) {
    console.error("❌ Failed to create promotion:", error.message);
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
