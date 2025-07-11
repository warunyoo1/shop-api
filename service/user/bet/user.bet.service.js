const UserBet = require("../../../models/userBetSchema.models");
const User = require("../../../models/user.model");
const LotterySet = require("../../../models/lotterySets.model");
const UserTransaction = require("../../../models/user.transection.model");
const mongoose = require("mongoose");

exports.createUserBet = async function (user_id, lottery_set_id, bets) {
  try {
    if (!lottery_set_id || !Array.isArray(bets) || bets.length === 0) {
      throw new Error("lottery_set_id และ bets ต้องไม่ว่าง");
    }

    const lotterySet = await validateLotterySet(lottery_set_id);
    const validOptionIds = lotterySet.betting_options.map((opt) =>
      String(opt._id)
    );

    const bettingOptionMap = {};
    lotterySet.betting_options.forEach((opt) => {
      bettingOptionMap[String(opt._id)] = {
        min_bet: opt.min_bet,
        max_bet: opt.max_bet,
      };
    });

    const validatedBets = validateAndCalculateBets(
      bets,
      validOptionIds,
      bettingOptionMap
    );
    const total_bet_amount = validatedBets.reduce(
      (sum, b) => sum + b.bet_amount,
      0
    );

    const user = await User.findById(user_id);
    const balance_before = user.credit;

    await validateUserCredit(user_id, total_bet_amount);
    await deductUserCredit(user_id, total_bet_amount);

    const userAfter = await User.findById(user_id);
    const balance_after = userAfter.credit;

    const bet = await createUserBetRecord(
      user_id,
      lottery_set_id,
      validatedBets,
      total_bet_amount
    );

    await UserTransaction.create({
      user_id,
      type: "bet",
      amount: total_bet_amount,
      balance_before,
      balance_after,
      ref_id: bet._id,
      description: "แทงหวย",
      created_at: new Date(),
    });
    return bet;
  } catch (error) {
    console.error("❌ createUserBet error:", error.message);
    throw error;
  }
};

exports.getUserBetsById = async function (user_id, lottery_set_id, status) {
  try {
    if (!user_id) throw new Error("user_id ต้องไม่ว่าง");

    const filter = { user_id };

    if (lottery_set_id) {
      filter.lottery_set_id = lottery_set_id;
    }
    if (status) {
      filter.status = status;
    }

    const bets = await UserBet.find(filter)
      .select("-bets -created_at -updated_at -user_id")
      .populate({
        path: "lottery_set_id",
        select: "-betting_options -closeTime -openTime",
        populate: {
          path: "lottery_type_id",
          select: "name -_id",
        },
      })
      .sort({ bet_date: -1 });

    const transformedBets = bets.map((bet) => {
      const betObj = bet.toObject();

      if (betObj.lottery_set_id && betObj.lottery_set_id.lottery_type_id) {
        betObj.lottery_set_id.lottery_type_name =
          betObj.lottery_set_id.lottery_type_id.name;
        delete betObj.lottery_set_id.lottery_type_id;
      }

      return betObj;
    });

    return transformedBets;
  } catch (error) {
    console.error("❌ getUserBetsById error:", error.message);
    throw error;
  }
};

exports.getAllUserBets = async function (page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const total = await UserBet.countDocuments();
    const bets = await UserBet.find()
      .populate("lottery_set_id")
      // .populate("bets.betting_option_id")
      .sort({ bet_date: -1 })
      .skip(skip)
      .limit(limit);

    return {
      bets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("❌ getAllUserBets error:", error.message);
    throw error;
  }
};

async function validateLotterySet(lottery_set_id) {
  const lotterySet = await LotterySet.findById(lottery_set_id);
  if (!lotterySet) throw new Error("ไม่พบชุดหวยชุดนี้");
  return lotterySet;
}

async function validateUserCredit(user_id, total_bet_amount) {
  const user = await User.findById(user_id);
  if (!user) throw new Error("ไม่พบผู้ใช้งาน");

  if (user.credit < total_bet_amount) {
    throw new Error("เครดิตไม่เพียงพอสำหรับการเดิมพัน");
  }

  return user;
}

async function deductUserCredit(user_id, amount) {
  await User.updateOne({ _id: user_id }, { $inc: { credit: -amount } });
}

async function createUserBetRecord(
  user_id,
  lottery_set_id,
  bets,
  total_bet_amount
) {
  const newUserBet = new UserBet({
    user_id,
    lottery_set_id,
    bets,
    total_bet_amount,
    status: "pending",
    payout_amount: 0,
    created_at: new Date(),
    updated_at: new Date(),
    bet_date: new Date(),
  });

  await newUserBet.save();
  return newUserBet;
}

function validateAndCalculateBets(bets, validOptionIds, bettingOptionMap) {
  try {
    for (const bet of bets) {
      const optionId = String(bet.betting_option_id);
      console.log("🔍 ตรวจสอบ betting_option_id:", optionId);

      if (!validOptionIds.includes(optionId)) {
        throw new Error(`betting_option_id ${optionId} ไม่อยู่ในชุดหวยนี้`);
      }

      const optionConfig = bettingOptionMap[optionId];
      if (!optionConfig) {
        throw new Error(`ไม่พบ config ของ betting_option_id ${optionId}`);
      }

      if (!Array.isArray(bet.numbers) || bet.numbers.length === 0) {
        throw new Error("numbers ใน bet ต้องไม่ว่าง");
      }

      const betAmount = bet.numbers.reduce((sum, n) => {
        console.log("➡️ ตรวจเลข:", n.number, "| amount:", n.amount);

        if (typeof n.amount !== "number" || n.amount <= 0) {
          throw new Error("amount ต้องเป็นตัวเลขมากกว่า 0");
        }

        if (n.amount < optionConfig.min_bet) {
          throw new Error(
            `เลข ${n.number} แทง ${n.amount} น้อยกว่าขั้นต่ำ ${optionConfig.min_bet} ของ option ${optionId}`
          );
        }

        if (n.amount > optionConfig.max_bet) {
          throw new Error(
            `เลข ${n.number} แทง ${n.amount} มากกว่าขั้นสูงสุด ${optionConfig.max_bet} ของ option ${optionId}`
          );
        }

        return sum + n.amount;
      }, 0);

      if (typeof bet.payout_rate !== "number") {
        throw new Error("payout_rate ต้องเป็นตัวเลข");
      }

      bet.bet_amount = betAmount;
      bet.payout_amount = betAmount * bet.payout_rate;

      console.log(
        `✅ bet_amount = ${bet.bet_amount}, payout_rate = ${bet.payout_rate}, payout_amount = ${bet.payout_amount}`
      );
    }

    console.log("🎉 validateAndCalculateBets สำเร็จ");
    return bets;
  } catch (error) {
    console.error("❌ validateAndCalculateBets error:", error.message);
    throw error;
  }
}

exports.cancelUserBet = async function (user_id, bet_id) {
  try {
    const userBet = await UserBet.findOne({
      _id: bet_id,
      user_id,
      status: "pending",
    });
    if (!userBet) {
      return null;
    }

    const user = await User.findById(user_id);
    const balance_before = user.credit;

    await User.updateOne(
      { _id: user_id },
      { $inc: { credit: userBet.total_bet_amount } }
    );

    const userAfter = await User.findById(user_id);
    const balance_after = userAfter.credit;

    userBet.status = "cancelled";
    userBet.updated_at = new Date();
    await userBet.save();

    await UserTransaction.create({
      user_id,
      type: "refund",
      amount: userBet.total_bet_amount,
      balance_before,
      balance_after,
      ref_id: userBet._id,
      description: "ยกเลิกการแทงหวยและคืนเครดิต",
      created_at: new Date(),
    });

    return userBet;
  } catch (error) {
    console.error("❌ cancelUserBet error:", error.message);
    throw error;
  }
};
