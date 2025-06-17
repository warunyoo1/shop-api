const mongoose = require("mongoose");
const moment = require("moment-timezone");
const Credit = require("../../models/credit.models");
const Promotion = require("../../models/promotion.model");
const User = require("../../models/user.model");

exports.createCredit = async function ({
  user_id,
  amount,
  type,
  description,
  promotion_id = null,
  created_at = new Date(),
}) {
  try {
    console.log("🔧 [Input]", {
      user_id,
      amount,
      type,
      promotion_id,
      created_at,
    });

    validateInput({ user_id, amount, type, promotion_id });

    const userIdObj = new mongoose.Types.ObjectId(user_id);
    const promotionIdObj = promotion_id
      ? new mongoose.Types.ObjectId(promotion_id)
      : null;

    const user = await User.findById(userIdObj);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const credit = await createCreditRecord({
      userIdObj,
      amount,
      type,
      description,
      promotionIdObj,
      created_at,
    });

    if (type === "topup") {
      await updateUserCredit(userIdObj, amount);

      if (promotionIdObj) {
        const promotion = await Promotion.findById(promotionIdObj);
        if (promotion) {
          await handleReferralBonus({
            user,
            promotion,
            promotionIdObj,
            userIdObj,
            created_at,
          });
        }
      }
    }

    return credit;
  } catch (error) {
    console.error("❌ Error in createCredit:", error.message);
    throw error;
  }
};

exports.getCreditById = async function (id) {
  return await Credit.findOne({ _id: id });
};

exports.getAllCredits = async function ({ page = 1, limit = 10 } = {}) {
  const skip = (page - 1) * limit;

  const credits = await Credit.find()
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Credit.countDocuments();

  return {
    data: credits,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

exports.getCreditStatsByUserId = async function (user_id) {
  try {
    if (!Types.ObjectId.isValid(user_id)) {
      throw new Error("Invalid user ID");
    }

    const results = await Credit.aggregate([
      {
        $match: {
          user_id: new Types.ObjectId(String(user_id)),
        },
      },
      {
        $group: {
          _id: null,
          total_amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (results.length === 0) {
      return { count: 0, total_amount: 0 };
    }

    return {
      count: results[0].count,
      total_amount: results[0].total_amount,
    };
  } catch (error) {
    console.error("Error in getCreditStatsByUserId:", error.message);
    throw new Error("Failed to get credit stats");
  }
};

exports.getUniqueTopupDays = async function (user_id, promotion_id) {
  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    throw new Error("Invalid user_id");
  }
  if (!mongoose.Types.ObjectId.isValid(promotion_id)) {
    throw new Error("Invalid promotion_id");
  }

  const userIdObj = new mongoose.Types.ObjectId(user_id);
  const promotionIdObj = new mongoose.Types.ObjectId(promotion_id);

  const creditCount = await Credit.aggregate([
    {
      $match: {
        user_id: userIdObj,
        promotion_id: promotionIdObj,
        type: "topup",
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
      },
    },
    {
      $count: "uniqueDays",
    },
  ]);

  const uniqueDaysCount = creditCount[0]?.uniqueDays || 0;
  return uniqueDaysCount;
};

function validateInput({ user_id, amount, type, promotion_id }) {
  try {
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      const error = new Error("Invalid user ID");
      error.statusCode = 400;
      throw error;
    }
    if (amount <= 0) {
      const error = new Error("Amount must be positive");
      error.statusCode = 400;
      throw error;
    }
    if (!type || !["topup", "bonus"].includes(type)) {
      const error = new Error("Invalid credit type");
      error.statusCode = 400;
      throw error;
    }
    if (promotion_id && !mongoose.Types.ObjectId.isValid(promotion_id)) {
      const error = new Error("Invalid promotion ID");
      error.statusCode = 400;
      throw error;
    }
  } catch (error) {
    throw error;
  }
}

async function updateUserCredit(userIdObj, amount) {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: userIdObj },
      { $inc: { credit: amount } },
      { new: true }
    );
    if (!updatedUser) {
      throw new Error("Failed to update user credit");
    }
    return updatedUser;
  } catch (error) {
    throw error;
  }
}

async function createCreditRecord({
  userIdObj,
  amount,
  type,
  description,
  promotionIdObj,
  created_at,
}) {
  try {
    return await Credit.create({
      user_id: userIdObj,
      amount,
      type,
      description,
      promotion_id: promotionIdObj,
      created_at: new Date(created_at),
    });
  } catch (error) {
    throw error;
  }
}

async function issueReferralBonus({ user, promotion, promotionIdObj }) {
  try {
    const updatedReferrer = await User.findOneAndUpdate(
      { _id: user.referral_user_id },
      { $inc: { credit: promotion.bonus_amount } },
      { new: true }
    );
    if (!updatedReferrer) {
      throw new Error("Failed to update referrer credit");
    }

    await Credit.create({
      user_id: user.referral_user_id,
      amount: promotion.bonus_amount,
      type: "bonus",
      description: `Referral bonus from user ${
        user.username || user._id
      } for promotion ${promotion.code}`,
      promotion_id: promotionIdObj,
      created_at: new Date(),
    });

    console.log(`✅ Referral bonus issued (${promotion.condition_type})`);
  } catch (error) {
    throw error;
  }
}

async function handleReferralBonus({
  user,
  promotion,
  promotionIdObj,
  userIdObj,
  created_at,
}) {
  try {
    const createdAtThai = moment(created_at).tz("Asia/Bangkok");
    const startDateThai = moment(promotion.start_date).tz("Asia/Bangkok");
    const endDateThai = moment(promotion.end_date).tz("Asia/Bangkok");

    if (
      !promotion.active ||
      createdAtThai.isBefore(startDateThai, "second") ||
      createdAtThai.isAfter(endDateThai, "second")
    ) {
      console.log("⛔ Promotion not active or out of date range");
      return;
    }

    if (
      !user.referral_user_id ||
      !mongoose.Types.ObjectId.isValid(user.referral_user_id)
    ) {
      console.log("🛑 No valid referral_user_id, skip referral bonus");
      return;
    }

    if (promotion.condition_type === "topup_once") {
      const existingBonus = await Credit.findOne({
        user_id: user.referral_user_id,
        promotion_id: promotionIdObj,
        type: "bonus",
      });

      if (!existingBonus) {
        await issueReferralBonus({ user, promotion, promotionIdObj });
      } else {
        console.log("🕐 Referral bonus already issued (topup_once)");
      }
    } else if (promotion.condition_type === "topup_count") {
      const creditCount = await Credit.aggregate([
        {
          $match: {
            user_id: userIdObj,
            promotion_id: promotionIdObj,
            type: "topup",
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$created_at",
                timezone: "Asia/Bangkok",
              },
            },
          },
        },
        {
          $count: "uniqueDays",
        },
      ]);

      const uniqueDaysCount = creditCount[0]?.uniqueDays || 0;
      console.log("📊 Topup Day Count:", uniqueDaysCount);

      if (uniqueDaysCount >= promotion.condition_value) {
        const existingBonus = await Credit.findOne({
          user_id: user.referral_user_id,
          promotion_id: promotionIdObj,
          type: "bonus",
        });

        if (!existingBonus) {
          await issueReferralBonus({ user, promotion, promotionIdObj });
        } else {
          console.log("🕐 Referral bonus already issued (topup_count)");
        }
      } else {
        const daysNeeded = promotion.condition_value - uniqueDaysCount;
        console.log(
          `🕐 Not enough unique topup days: have ${uniqueDaysCount} day(s), need ${promotion.condition_value} day(s).`
        );
        console.log(
          `🕐 Please top up for ${daysNeeded} more day(s) to qualify.`
        );
        console.log("🕐 Not enough unique topup days:", {
          have: uniqueDaysCount,
          need: promotion.condition_value,
        });
      }
    } else {
      console.log("⛔ Unknown promotion condition type");
    }
  } catch (error) {
    throw error;
  }
}
