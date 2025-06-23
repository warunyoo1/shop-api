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

exports.getHuay = async (lottery_set_id) => {
  try {
    if (!lottery_set_id) {
      throw new Error("lottery_set_id is required.");
    }

    const huayData = await huay.find({ lottery_set_id });
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

exports.evaluateUserBetsByLotterySet = async function (lottery_set_id) {
  try {
    if (!lottery_set_id) {
      throw new Error("ต้องระบุ lottery_set_id");
    }

    // 1. รวบรวมเลขถูกรางวัลทั้งหมดในงวดนี้
    const huayResults = await huay.find({ lottery_set_id });

    if (!huayResults || huayResults.length === 0) {
      throw new Error("ไม่พบผลรางวัลของงวดนี้");
    }

    const winningNumbers = huayResults.flatMap((h) => h.huay_number || []);
    console.log(`📌 ตรวจงวด: ${lottery_set_id}`);
    console.log(`🏆 เลขที่ถูกรางวัลรวม: ${JSON.stringify(winningNumbers)}`);

    // 2. หาผู้ใช้ที่ยังไม่ถูกตรวจ
    const pendingBets = await UserBet.find({
      lottery_set_id,
      status: "pending",
    });

    console.log(`📦 พบผู้ใช้ที่ยังไม่ตรวจ: ${pendingBets.length} คน`);

    const updatedBets = [];

    for (const userBet of pendingBets) {
      let hasWon = false;
      let payoutAmount = 0;

      console.log(`👤 ตรวจ user: ${userBet.user_id}`);

      for (const bet of userBet.bets) {
        for (const numObj of bet.numbers) {
          const userNumber = numObj.number;
          const amount = numObj.amount;
          const rate = bet.payout_rate;

          const isWin = winningNumbers.includes(userNumber);

          console.log(
            `➡️ แทงเลข: ${userNumber}, จำนวน: ${amount}, อัตรา: ${rate} | ${
              isWin ? "✅ ถูก" : "❌ ไม่ถูก"
            }`
          );

          if (isWin) {
            hasWon = true;
            payoutAmount += amount * rate;
          }
        }
      }

      userBet.status = hasWon ? "won" : "lost";
      userBet.payout_amount = payoutAmount;
      userBet.updated_at = new Date();
      await userBet.save();

      console.log(
        `🎯 ผล: ${userBet.status.toUpperCase()}, รับเงิน: ${payoutAmount}`
      );

      updatedBets.push(userBet);
    }

    console.log(`\n✅ ตรวจเสร็จทั้งหมด ${updatedBets.length} รายการ`);
    return updatedBets;
  } catch (error) {
    console.error("❌ evaluateUserBetsByLotterySet error:", error.message);
    throw error;
  }
};

exports.getAllHuay = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const total = await huay.countDocuments();
    const huays = await huay.find().skip(skip).limit(limit);
    return {
      huays,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Failed to retrieve all Huay data:", error.message);
    throw new Error("Error retrieving all Huay data: " + error.message);
  }
};
