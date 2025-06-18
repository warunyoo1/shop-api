const mongoose = require("mongoose");
const Promotion = require("../../models/promotion.model");
const User = require("../../models/user.model");
const UserPromotion = require("../../models/userPromotions.models");

exports.createPromotion = async function (promotionData) {
  try {
    // 🔍 ตรวจสอบเฉพาะตอน target = 'specific'
    if (promotionData.target === "specific") {
      await validateSpecificUsers(promotionData.specificUsers || []);
    }

    const savedPromotion = await createNewPromotion(promotionData);

    const userFilter = getUserFilterByTarget(
      promotionData.target,
      promotionData.specificUsers || []
    );

    await createUserPromotionsForUsers(savedPromotion._id, userFilter);

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

async function createNewPromotion(promotionData) {
  const promotion = new Promotion(promotionData);
  return await promotion.save();
}

async function createUserPromotionsForUsers(promotionId, userFilter) {
  try {
    const targetUsers = await User.find(userFilter);
    if (targetUsers.length === 0) {
      console.log("ℹ️ No users matched target criteria.");
      return;
    }

    for (const user of targetUsers) {
      if (!user._id) continue;

      try {
        const existingUserPromotion = await UserPromotion.findOne({
          user_id: user._id,
        });

        const newPromotion = {
          promotion_id: promotionId,
          status: "pending",
          progress: {
            depositCount: 0,
            depositTotal: 0,
            betTotal: 0,
            lossTotal: 0,
            lastDepositDate: null,
            consecutiveDays: 0,
          },
          reward: {
            amount: 0,
            withdrawable: false,
            givenAt: null,
          },
          note: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (existingUserPromotion) {
          const alreadyHasPromotion = existingUserPromotion.promotions.some(
            (promo) => promo.promotion_id.toString() === promotionId.toString()
          );
          if (!alreadyHasPromotion) {
            existingUserPromotion.promotions.push(newPromotion);
            existingUserPromotion.updatedAt = new Date();
            await existingUserPromotion.save();
            console.log(
              `✅ Added promotion to existing UserPromotion for user ${user._id}`
            );
          } else {
            console.log(`ℹ️ User ${user._id} already has this promotion`);
          }
        } else {
          const newUserPromotion = new UserPromotion({
            user_id: user._id,
            balance: 0,
            promotions: [newPromotion],
          });
          await newUserPromotion.save();
          console.log(`✅ Created new UserPromotion for user ${user._id}`);
        }
      } catch (innerError) {
        console.error(`❌ Error processing user ${user._id}:`, innerError);
      }
    }
  } catch (error) {
    console.error("❌ Error creating user promotions:", error);
    throw error;
  }
}

function getUserFilterByTarget(target, specificUsers = []) {
  if (specificUsers && specificUsers.length > 0 && target !== "specific") {
    throw new Error("specificUsers can only be used when target is 'specific'");
  }
  switch (target) {
    case "master":
      return { master_id: { $ne: null } };
    case "referrer":
      return { referral_by: { $ne: null } };
    case "normal":
      return { referral_by: null, master_id: null };
    case "specific":
      if (!Array.isArray(specificUsers) || specificUsers.length === 0) {
        throw new Error(
          "specificUsers ต้องเป็น array ที่ไม่ว่างเมื่อ target เป็น 'specific'"
        );
      }
      return {
        _id: {
          $in: specificUsers.map((id) => new mongoose.Types.ObjectId(id)),
        }, // ✅ ถูก
      };

    case "all":
      return {};
    default:
      throw new Error(`Invalid target type: ${target}`);
  }
}

async function validateSpecificUsers(specificUsers) {
  try {
    const objectIds = specificUsers.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    const foundUsers = await User.find({ _id: { $in: objectIds } }).select(
      "_id"
    );
    const foundIds = foundUsers.map((user) => user._id.toString());

    const notFoundIds = specificUsers.filter(
      (id) => !foundIds.includes(id.toString())
    );

    if (notFoundIds.length > 0) {
      throw new Error(`User(s) not found for ID(s): ${notFoundIds.join(", ")}`);
    }

    return objectIds;
  } catch (err) {
    console.error("❌ Error in validateSpecificUsers:", err.message);
    throw err;
  }
}
