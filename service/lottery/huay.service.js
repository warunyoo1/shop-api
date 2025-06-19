const huay = require("../../models/huay.model");
const LotterySets = require("../../models/lotterySets.model");
const UserBet = require("../../models/userBetSchema.models");

exports.create = async (data, lottery_set_id) => {
  try {
    const set = await LotterySets.findById(lottery_set_id);
    if (!set) {
      throw new Error("Invalid lottery_set_id : set not found.");
    }

    let result;

    if (Array.isArray(data)) {
      result = await huay.insertMany(data);
    } else {
      result = await huay.create(data);
    }

    return {
      message: "Huay data inserted successfully",
      content: result,
    };
  } catch (error) {
    console.error("Failed to insert Huay data:", error.message);
    throw new Error("Error inserting Huay data: " + error.message);
  }
};

exports.getHuay = async (lotteryItemId) => {
  try {
    if (!lotteryItemId) {
      throw new Error("lotteryItemId is required.");
    }

    const huayData = await huay.find({ lottery_item_id: lotteryItemId });
    return huayData;
  } catch (error) {
    console.error("Failed to retrieve Huay data:", error.message);
    throw new Error("Error retrieving Huay data: " + error.message);
  }
};

exports.getHuayById = async (huayId) => {
  try {
    const huayData = await huay.findById(huayId);
    if (!huayData) {
      throw new Error("Huay data not found.");
    }
    return huayData;
  } catch (error) {
    console.error("Failed to retrieve Huay data by ID:", error.message);
    throw new Error("Error retrieving Huay data by ID: " + error.message);
  }
};

exports.updateHuay = async (huayId, data) => {
  try {
    const updatedHuay = await huay.findByIdAndUpdate(huayId, data, {
      new: true,
    });
    return updatedHuay;
  } catch (error) {
    console.error("Failed to update Huay data:", error.message);
    throw new Error("Error updating Huay data: " + error.message);
  }
};

exports.evaluateUserBets = async function (lottery_set_id) {
  try {
    if (!lottery_set_id) {
      throw new Error("ต้องระบุ lottery_set_id");
    }

    const Huay = await huay.findOne({ lottery_set_id });
    if (!Huay) throw new Error("ไม่พบผลรางวัลของงวดนี้");

    const winningNumbers = Huay.huay_number;

    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    const updatedBets = [];
    for (const userBet of pendingBets) {
      let hasWon = false;
      let payoutAmount = 0;

      for (const bet of userBet.bets) {
        for (const number of bet.numbers) {
          if (winningNumbers.includes(number.number)) {
            hasWon = true;
            payoutAmount += number.amount * bet.payout_rate;
          }
        }
      }

      userBet.status = hasWon ? "won" : "lost";
      userBet.payout_amount = payoutAmount;
      userBet.updated_at = new Date();
      await userBet.save();

      updatedBets.push(userBet);
    }

    return updatedBets;
  } catch (error) {
    console.error("❌ evaluateUserBets error:", error.message);
    throw error;
  }
};
