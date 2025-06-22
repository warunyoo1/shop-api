const mongoose = require("mongoose");
const moment = require("moment-timezone");
const Credit = require("../../models/credit.models");
const Promotion = require("../../models/promotion.model");
const User = require("../../models/user.model");
const UserPromotion = require("../../models/userPromotions.models");
const { handleSuccess, handleError } = require("../../utils/responseHandler");
//อันเก่า

exports.createCredit = async function ({
  user_id,
  amount,
  channel,
  description,
}) {
  try{
    // เช็คว่า user_id มีอยู่ในฐานข้อมูลหรือไม่
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("ไม่พบผู้ใช้งานในระบบ");
    }

    // เช็คว่า amount มีค่ามากกว่า 0 หรือไม่
    if (amount <= 0) {
      throw new Error("จำนวนเงินต้องมากกว่า 0");
    }

    // เช็คว่ามีี  userPromotions  หรือยัง  ถ้าไม่มีให้สร้าง 
    let userPromotion = await UserPromotion.findOne({ user_id });
    if(!userPromotion){
      // ทำการสร้างใหม่
      const newUserPromotion = new UserPromotion({
        user_id,
        balance: 0,
        promotions: [],
      });
      userPromotion = await newUserPromotion.save();
    }

    // เช็ค promotion  ว่า มีอยุ่ในช่วงเวลานี้ไหม  ถ้า endDate เป็น null แปลว่าไม่มีวันอายุโปร ดึงมา  และต้องเป็น ประเภท  daily-deposit instant-bonus turnover-bonus
    const promotions = await Promotion.find({
      type: { $in: ["daily-deposit", "instant-bonus", "turnover-bonus"] },
      startDate: { $lte: new Date() },
      $or: [
        { endDate: { $gte: new Date() } },
        { endDate: null }
      ]
    });
    
    // กรองโปรโมชั่นตาม target ที่เหมาะสมกับผู้ใช้
    const eligiblePromotions = promotions.filter(promotion => {
      return isUserEligibleForPromotion(user, promotion);
    });
    
    let credit_promotion = 0;
    let promotion_id = null;
    
    if(eligiblePromotions.length > 0){
      // ตรวจสอบโปรที่มีอยู่ก่อน
      const existingResult = await checkExistingPromotions(user, userPromotion, eligiblePromotions, amount);
      
      if(existingResult.foundActivePromotion) {
        // พบโปรที่กำลังดำเนินการและได้รับโบนัสแล้ว
        credit_promotion = existingResult.credit_promotion;
        promotion_id = existingResult.promotion_id;
      } else {
        // ไม่พบโปรที่กำลังดำเนินการ ให้ตรวจสอบโปรใหม่
        const newResult = await checkNewPromotions(user, userPromotion, eligiblePromotions, amount);
        credit_promotion = newResult.credit_promotion;
        promotion_id = newResult.promotion_id;
      }
    }

    // บันทึกข้อมูล userPromotion
    await userPromotion.save();

    // อัพเดท netAmount ใน credit
    const finalAmount = amount + credit_promotion;
    const newCredit = new Credit({
      user_id: user._id,
      promotion_id: promotion_id,
      amount,
      credit_promotion: credit_promotion,
      netAmount: finalAmount,
      fee: 0,
      
      channel,
      description,
      status: 'success',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // บันทึกข้อมูล
    await newCredit.save();

    //ทำการเพิ่ม credit ให้กับ user (รวม promotion แล้ว)
    user.credit += finalAmount;
    await user.save();

    return newCredit;

  }catch(error){
    throw error;
  }
};

//แก้ไข
exports.updateCredit = async function ({
  id,
  amount,
  channel,
  description,
}) {
  try {
    const credit = await Credit.findById(id);
    if (!credit) {
      throw new Error("ไม่พบข้อมูล credit");
    }

    // อัพเดทข้อมูล
    credit.amount = amount || credit.amount;
    credit.channel = channel || credit.channel;
    credit.description = description || credit.description;
    credit.updated_at = new Date();

    await credit.save();

    return credit;
  } catch (error) {
    throw error;
  }
};

// อนุมัติ
exports.approveCredit = async function ({
  id,
}) {
  try {
    const credit = await Credit.findById(id);
    if (!credit) {
      throw new Error("ไม่พบข้อมูล credit");
    }

    if (credit.status === 'success') {
      throw new Error("credit นี้ถูกอนุมัติไปแล้ว");
    }

    // อัพเดทสถานะเป็น success
    credit.status = 'success';
    credit.updated_at = new Date();
    await credit.save();

    // เพิ่ม credit ให้กับ user
    const user = await User.findById(credit.user_id);
    if (!user) {
      throw new Error("ไม่พบข้อมูลผู้ใช้");
    }

    user.credit += credit.amount;
    await user.save();

    return credit;
  } catch (error) {
    throw error;
  }
};

// ยกเลิก
exports.cancelCredit = async function ({
  id,
}) {
  try {
    const credit = await Credit.findById(id);
    if (!credit) {
      throw new Error("ไม่พบข้อมูล credit");
    }

    if (credit.status === 'cancel') {
      throw new Error("credit นี้ถูกยกเลิกไปแล้ว");
    }

    // ถ้าสถานะเป็น success ให้คืน credit กลับ
    if (credit.status === 'success') {
      const user = await User.findById(credit.user_id);
      if (!user) {
        throw new Error("ไม่พบข้อมูลผู้ใช้");
      }
      user.credit -= credit.amount;
      await user.save();
    }

    // อัพเดทสถานะเป็น cancel
    credit.status = 'cancel';
    credit.updated_at = new Date();
    await credit.save();

    return credit;
  } catch (error) {
    throw error;
  }
};

// ดึงตาม id
exports.getCreditById = async function (id) {
  return await Credit.findOne({ _id: id });
};

// ดึงทั้งหมด
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

// ดึงประวัติการเติมเงินตาม user id
exports.getCreditsByUserId = async function (user_id, { page = 1, limit = 10, status } = {}) {
  try {
    const skip = (page - 1) * limit;
    
    // สร้าง query object
    let query = { user_id };
    if (status) {
      query.status = status;
    }

    const credits = await Credit.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Credit.countDocuments(query);

    return {
      data: credits,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

// ลบการเติมเงิน
exports.deleteCredit = async function ({
  id,
}) {
  try {
    const credit = await Credit.findById(id);
    if (!credit) {
      throw new Error("ไม่พบข้อมูล credit");
    }

    // ถ้าสถานะเป็น success ให้หักเงินคืนจาก user
    if (credit.status === 'success') {
      const user = await User.findById(credit.user_id);
      if (!user) {
        throw new Error("ไม่พบข้อมูลผู้ใช้");
      }
      user.credit -= credit.amount;
      await user.save();
    }

    // ลบข้อมูล credit
    await Credit.findByIdAndDelete(id);

    return { message: "ลบข้อมูล credit สำเร็จ" };
  } catch (error) {
    throw error;
  }
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

// ฟังก์ชั่นตรวจสอบความเหมาะสมของผู้ใช้กับโปรโมชั่น
function isUserEligibleForPromotion(user, promotion) {
  // ตรวจสอบ target ของโปรโมชั่น
  const promotionTarget = promotion.target;
  
  // ตรวจสอบสิทธิ์ของผู้ใช้
  const userTargets = getUserTargets(user);
  
  // เช็คว่า target ของโปรอยู่ในสิทธิ์ของผู้ใช้หรือไม่
  if (userTargets.includes(promotionTarget)) {
    return true;
  }
  
  // ตรวจสอบ target "specific" แยกต่างหาก
  if (promotionTarget === "specific") {
    return promotion.specificUsers && promotion.specificUsers.some(id => id.equals(user._id));
  }
  
  return false;
}

// ฟังก์ชั่นดึง target ทั้งหมดของผู้ใช้
function getUserTargets(user) {
  const targets = [];
  
  // เพิ่ม target ตามสถานะของผู้ใช้
  if (user.master_id) {
    targets.push('master'); // คนที่สมัครกับ master
  }
  
  if (user.referral_user_id) {
    targets.push('referrer'); // คนที่สมัครผ่านเพื่อน (referee)
  }
  
  if (!user.master_id && !user.referral_user_id) {
    targets.push('normal'); // คนที่สมัครเองโดยไม่ผ่านใคร
  }
  
  // 'all' เป็นสิทธิ์พิเศษที่ทุกคนมี
  targets.push('all');
  
  return targets;
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

// ฟังก์ชั่นจัดการ daily-deposit promotion
async function handleDailyDepositPromotion(user, userPromotion, promotion, amount) {
  const conditions = promotion.conditions;
  const depositAmount = conditions.depositAmount;
  const depositDays = conditions.depositDays;
  const maxBonusAmount = conditions.maxBonusAmount;
  const maxDepositCountPerDay = conditions.maxDepositCountPerDay;

  if (amount < depositAmount) {
    return { credit_promotion: 0, promotion_id: null };
  }

  // เช็คว่ามี promotions array หรือไม่
  if (!userPromotion.promotions || !Array.isArray(userPromotion.promotions)) {
    userPromotion.promotions = [];
  }

  let check_promotion = userPromotion.promotions.find(p => p.promotion_id.equals(promotion._id));
  const today = new Date();

  if (check_promotion) {
    // มีโปรนี้อยู่แล้ว เช็คเงื่อนไขต่อ
    const todayStr = moment(today).format('YYYY-MM-DD');
    const lastDepositStr = check_promotion.progress.lastDepositDate ? 
      moment(check_promotion.progress.lastDepositDate).format('YYYY-MM-DD') : null;

    // เช็คว่าฝากวันนี้แล้วหรือยัง
    if (lastDepositStr === todayStr) {
      // ฝากวันนี้แล้ว เช็คจำนวนครั้งต่อวัน
      if (maxDepositCountPerDay > 0 && check_promotion.progress.depositCount >= maxDepositCountPerDay) {
        return { credit_promotion: 0, promotion_id: null };
      }
    }

    // อัพเดทข้อมูลการฝาก
    check_promotion.progress.depositCount += 1;
    check_promotion.progress.depositTotal += amount;
    check_promotion.progress.lastDepositDate = today;
    check_promotion.updatedAt = today;

    // เช็คว่าครบเงื่อนไขหรือยัง
    if (check_promotion.progress.depositCount >= depositDays) {
      if (check_promotion.status === 'pending') {
        check_promotion.status = 'completed';

        const rewards = promotion.rewards;
        if (!rewards) {
          console.log("ไม่พบ reward ใน promotion:", promotion._id);
          return { credit_promotion: 0, promotion_id: null };
        }

        const rewardType = rewards.type || 'percentage';
        const rewardAmount = rewards.amount || 10;
        const rewardBasedOn = rewards.basedOn || 'deposit';

        let finalRewardAmount = 0;

        if (rewardType === 'percentage') {
          if (rewardBasedOn === 'deposit') {
            finalRewardAmount = (check_promotion.progress.depositTotal * rewardAmount) / 100;
          } else if (rewardBasedOn === 'amount') {
            finalRewardAmount = (amount * rewardAmount) / 100;
          }
        } else if (rewardType === 'fixed') {
          finalRewardAmount = rewardAmount;
        }

        if (maxBonusAmount && maxBonusAmount > 0 && finalRewardAmount > maxBonusAmount) {
          finalRewardAmount = maxBonusAmount;
        }

        check_promotion.reward.amount = finalRewardAmount;
        check_promotion.reward.withdrawable = rewards.withdrawable || false;
        check_promotion.reward.givenAt = today;

        return {
          credit_promotion: finalRewardAmount,
          promotion_id: promotion._id
        };
      }
    }
  } else {
    // ยังไม่มีโปรนี้ สร้างใหม่
    const newUserPromotionItem = {
      promotion_id: promotion._id,
      status: 'pending',
      progress: {
        depositCount: 1,
        depositTotal: amount,
        betTotal: 0,
        lossTotal: 0,
        lastDepositDate: today,
        consecutiveDays: 1
      },
      reward: {
        amount: 0,
        withdrawable: false
      },
      createdAt: today,
      updatedAt: today
    };

    userPromotion.promotions.push(newUserPromotionItem);
  }

  return { credit_promotion: 0, promotion_id: promotion._id };
}

// ฟังก์ชั่นจัดการ instant-bonus promotion
async function handleInstantBonusPromotion(user, userPromotion, promotion, amount) {
  const conditions = promotion.conditions;
  const depositAmount = conditions.depositAmount;
  const maxBonusAmount = conditions.maxBonusAmount;
  const maxDepositCountPerDay = conditions.maxDepositCountPerDay;

  if (amount < depositAmount) {
    return { credit_promotion: 0, promotion_id: null };
  }

  // เช็คว่ามี promotions array หรือไม่
  if (!userPromotion.promotions || !Array.isArray(userPromotion.promotions)) {
    userPromotion.promotions = [];
  }

  let check_promotion = userPromotion.promotions.find(p => p.promotion_id.equals(promotion._id));
  const today = new Date();

  if (check_promotion) {
    // มีโปรนี้อยู่แล้ว เช็คเงื่อนไขต่อ
    const todayStr = moment(today).format('YYYY-MM-DD');
    const lastDepositStr = check_promotion.progress.lastDepositDate ? 
      moment(check_promotion.progress.lastDepositDate).format('YYYY-MM-DD') : null;

    // เช็คว่าฝากวันนี้แล้วหรือยัง
    if (lastDepositStr === todayStr) {
      // ฝากวันนี้แล้ว เช็คจำนวนครั้งต่อวัน
      if (maxDepositCountPerDay > 0 && check_promotion.progress.depositCount >= maxDepositCountPerDay) {
        return { credit_promotion: 0, promotion_id: null };
      }
    }

    // อัพเดทข้อมูลการฝาก
    check_promotion.progress.depositCount += 1;
    check_promotion.progress.depositTotal += amount;
    check_promotion.progress.lastDepositDate = today;
    check_promotion.updatedAt = today;
  } else {
    // ยังไม่มีโปรนี้ สร้างใหม่
    const newUserPromotionItem = {
      promotion_id: promotion._id,
      status: 'pending',
      progress: {
        depositCount: 1,
        depositTotal: amount,
        betTotal: 0,
        lossTotal: 0,
        lastDepositDate: today,
        consecutiveDays: 1
      },
      reward: {
        amount: 0,
        withdrawable: false
      },
      createdAt: today,
      updatedAt: today
    };

    userPromotion.promotions.push(newUserPromotionItem);
  }

  // คำนวณโบนัสทันที
  const rewards = promotion.rewards;
  if (rewards) {
    const rewardType = rewards.type || 'fixed';
    const rewardAmount = rewards.amount || 0;
    const rewardBasedOn = rewards.basedOn || 'deposit';

    let finalRewardAmount = 0;

    if (rewardType === 'percentage') {
      if (rewardBasedOn === 'deposit') {
        finalRewardAmount = (amount * rewardAmount) / 100;
      } else if (rewardBasedOn === 'amount') {
        finalRewardAmount = (amount * rewardAmount) / 100;
      }
    } else if (rewardType === 'fixed') {
      finalRewardAmount = rewardAmount;
    }

    if (maxBonusAmount && maxBonusAmount > 0 && finalRewardAmount > maxBonusAmount) {
      finalRewardAmount = maxBonusAmount;
    }

    // อัพเดทข้อมูล reward ใน userPromotion
    if (check_promotion) {
      check_promotion.reward.amount = finalRewardAmount;
      check_promotion.reward.withdrawable = rewards.withdrawable || false;
      check_promotion.reward.givenAt = today;
      check_promotion.status = 'completed';
    }

    return {
      credit_promotion: finalRewardAmount,
      promotion_id: promotion._id
    };
  }

  return { credit_promotion: 0, promotion_id: promotion._id };
}

// ฟังก์ชั่นจัดการ turnover-bonus promotion
async function handleTurnoverBonusPromotion(user, userPromotion, promotion, amount) {
  // รอก่อน - ยังไม่ได้ implement
  return { credit_promotion: 0, promotion_id: null };
}

// ฟังก์ชั่นตรวจสอบโปรที่มีอยู่
async function checkExistingPromotions(user, userPromotion, eligiblePromotions, amount) {
  if (!userPromotion.promotions || !Array.isArray(userPromotion.promotions) || userPromotion.promotions.length === 0) {
    return { foundActivePromotion: false, credit_promotion: 0, promotion_id: null };
  }

  for (const userPromo of userPromotion.promotions) {
    if (userPromo.status === 'pending') {
      const matchingPromotion = eligiblePromotions.find(p => p._id.equals(userPromo.promotion_id));
      if (matchingPromotion) {
        let result = { credit_promotion: 0, promotion_id: null };

        switch (matchingPromotion.type) {
          case "daily-deposit":
            result = await handleDailyDepositPromotion(user, userPromotion, matchingPromotion, amount);
            break;
          case "instant-bonus":
            result = await handleInstantBonusPromotion(user, userPromotion, matchingPromotion, amount);
            break;
          case "turnover-bonus":
            result = await handleTurnoverBonusPromotion(user, userPromotion, matchingPromotion, amount);
            break;
        }

        if (result.credit_promotion > 0) {
          return { foundActivePromotion: true, ...result };
        }
      }
    }
  }

  return { foundActivePromotion: false, credit_promotion: 0, promotion_id: null };
}

// ฟังก์ชั่นตรวจสอบโปรใหม่
async function checkNewPromotions(user, userPromotion, eligiblePromotions, amount) {
  for (const promotion of eligiblePromotions) {
    let result = { credit_promotion: 0, promotion_id: null };

    switch (promotion.type) {
      case "daily-deposit":
        result = await handleDailyDepositPromotion(user, userPromotion, promotion, amount);
        break;
      case "instant-bonus":
        result = await handleInstantBonusPromotion(user, userPromotion, promotion, amount);
        break;
      case "turnover-bonus":
        result = await handleTurnoverBonusPromotion(user, userPromotion, promotion, amount);
        break;
    }

    if (result.credit_promotion > 0) {
      return result;
    }
  }

  return { credit_promotion: 0, promotion_id: null };
}
