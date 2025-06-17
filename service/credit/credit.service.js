const mongoose = require("mongoose");
const moment = require("moment-timezone");
const Credit = require("../../models/credit.models");
const Promotion = require("../../models/promotion.model");
const User = require("../../models/user.model");
const UserPromotion = require("../../models/userPromotions.models");

exports.createCredit = async function ({
  user_id,
  amount,
  type,
  description = "",
}) {
  try {
    const user = await User.findById(user_id);
    if (!user) {
      console.error("❌ User not found:", user_id);
      throw new Error("User not found");
    }

    console.log("✅ User found:", {
      _id: user._id,
      referral_by: user.referral_by,
      master_id: user.master_id,
    });

    const promotions = await Promotion.find({
      type,
      active: true,
    });

    console.log(`🔍 Found ${promotions.length} promotions for type: ${type}`);
    promotions.forEach((p, i) => {
      console.log(`➡️ Promo ${i + 1}:`, {
        _id: p._id,
        name: p.name,
        target: p.target,
        depositAmount: p.conditions?.depositAmount,
      });
    });

    let matchedPromotion = null;
    for (const promo of promotions) {
      const eligible = await isUserEligibleForPromotion(user, promo);
      console.log(`🧪 Checking promo ${promo.name} (id: ${promo._id})`);
      console.log(`   - User eligible?`, eligible);
      console.log(
        `   - Deposit amount (${amount}) >= required (${promo.conditions?.depositAmount})?`,
        amount >= (promo.conditions?.depositAmount || 0)
      );

      if (eligible && amount >= (promo.conditions?.depositAmount || 0)) {
        matchedPromotion = promo;
        console.log("✅ Matched promotion:", promo.name);
        break;
      }
    }

    if (!matchedPromotion) {
      console.log("⚠️ No matched promotion for user:", user._id);
    }

    const newCredit = new Credit({
      user_id: user._id,
      amount,
      type,
      description,
      promotion_id: matchedPromotion ? matchedPromotion._id : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newCredit.save();
    console.log("💾 New credit saved:", newCredit);

    if (matchedPromotion) {
      await updateUserPromotionProgress(user._id, matchedPromotion._id, amount);
      console.log("📈 Promotion progress updated.");
    }

    return newCredit;
  } catch (error) {
    console.error("🔥 Error in createCredit:", error);
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

async function isUserEligibleForPromotion(user, promotion) {
  console.log(
    `Checking eligibility for user: ${user._id} with promotion target: ${promotion.target}`
  );

  switch (promotion.target) {
    case "referrer":
      const isReferrer = !!user.referral_by;
      console.log(
        "User referral_by:",
        user.referral_by,
        "Eligible:",
        isReferrer
      );
      return isReferrer;

    case "master":
      const isMaster = !!user.master_id;
      console.log("User master_id:", user.master_id, "Eligible:", isMaster);
      return isMaster;

    case "normal":
      const isNormal = !user.referral_by && !user.master_id;
      console.log("Normal user check:", isNormal);
      return isNormal;

    case "specific":
      if (!promotion.specificUsers || promotion.specificUsers.length === 0)
        return false;
      const isSpecific = promotion.specificUsers.some((id) =>
        id.equals(user._id)
      );
      console.log("Specific user check:", isSpecific);
      return isSpecific;

    case "all":
      return true;

    default:
      return false;
  }
}

async function updateUserPromotionProgress(
  user_id,
  promotionId,
  depositAmount
) {
  try {
    let userPromo = await UserPromotion.findOne({ user_id, promotionId });
    console.log("🔍 Checking UserPromotion for user:", user_id, "and promotion:", promotionId);

    if (!userPromo) {
      userPromo = new UserPromotion({
        user_id,
        promotionId,
        status: "pending",
        progress: {
          depositCount: 1,
          depositTotal: depositAmount,
          betTotal: 0,
          lossTotal: 0,
          lastDepositDate: new Date(),
          consecutiveDays: 1,
        },
        reward: {
          amount: 0,
          withdrawable: false,
        },
      });
    } else {
      userPromo.progress.depositCount += 1;
      userPromo.progress.depositTotal += depositAmount;
      userPromo.progress.lastDepositDate = new Date();
    }

    userPromo.updatedAt = new Date();
    await userPromo.save();
    console.log("UserPromotion updated:", userPromo);
  } catch (error) {
    console.error("Failed to update user promotion progress:", error);
    throw error;
  }
}
