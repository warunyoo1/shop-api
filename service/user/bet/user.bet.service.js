const UserBet = require("../../../models/userBetSchema.models");
const User = require("../../../models/user.model");
const LotterySet = require("../../../models/lotterySets.model");
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

    const validatedBets = validateAndCalculateBets(bets, validOptionIds);
    const total_bet_amount = validatedBets.reduce(
      (sum, b) => sum + b.bet_amount,
      0
    );

    await validateUserCredit(user_id, total_bet_amount);
    await deductUserCredit(user_id, total_bet_amount);

    const bet = await createUserBetRecord(
      user_id,
      lottery_set_id,
      validatedBets,
      total_bet_amount
    );
    return bet;
  } catch (error) {
    console.error("❌ createUserBet error:", error.message);
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

function validateAndCalculateBets(bets, validOptionIds) {
  for (const bet of bets) {
    const optionId = String(bet.betting_option_id);
    if (!validOptionIds.includes(optionId)) {
      throw new Error(`betting_option_id ${optionId} ไม่อยู่ในชุดหวยนี้`);
    }

    if (!Array.isArray(bet.numbers) || bet.numbers.length === 0) {
      throw new Error("numbers ใน bet ต้องไม่ว่าง");
    }

    const betAmount = bet.numbers.reduce((sum, n) => {
      if (typeof n.amount !== "number" || n.amount <= 0) {
        throw new Error("amount ต้องเป็นตัวเลขมากกว่า 0");
      }
      return sum + n.amount;
    }, 0);

    if (typeof bet.payout_rate !== "number") {
      throw new Error("payout_rate ต้องเป็นตัวเลข");
    }

    bet.bet_amount = betAmount;
  }

  return bets;
}
