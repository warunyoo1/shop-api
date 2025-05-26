const LotterySets = require("../../models/lotterySets.model");
const LotteryType = require("../../models/lotteryType.model");
const BettingType = require("../../models/bettingTypes.model");

exports.createLotterySets = async function (data) {
  try {
    validateInput(data);
    await validateLotteryType(data.lottery_type_id);
    validateBettingOptions(data.betting_options);

    const createdSet = await LotterySets.create(data);

    return createdSet;
  } catch (error) {
    console.error("Error creating lottery sets:", error.message);
    throw error;
  }
};

exports.getLotterySets = async function () {
  return await LotterySets.find();
};

exports.getLotteryById = async function (lotteryId) {
  try {
    const lottery = await LotterySets.findById(lotteryId);
    if (!lottery) {
      throw new Error("Lottery LotterySets not found.");
    }
    return lottery;
  } catch (error) {
    throw new Error("Error retrieving lotterySets: " + error.message);
  }
};

exports.updateLotterySets = async function (lotteryId, data) {
  try {
    const updatedLotterySets = await LotterySets.findByIdAndUpdate(
      lotteryId,
      data,
      { new: true }
    );

    if (!updatedLotterySets) {
      throw new Error("Lottery not found.");
    }

    return updatedLotterySets;
  } catch (error) {
    console.error("Error updating lottery item:", error.message);
    throw error;
  }
};

exports.deleteAllLottery = async function () {
  try {
    const deletedItems = await LotterySets.deleteMany();
    return deletedItems;
  } catch (error) {
    console.error("Error deleting all lottery Sets:", error.message);
    throw error;
  }
};

exports.deleteLottery = async function (lotteryId) {
  try {
    const deletedLottery = await LotterySets.findByIdAndDelete(lotteryId);
    if (!deletedLottery) {
      throw new Error("Lottery Sets not found.");
    }
    return deletedLottery;
  } catch (error) {
    console.error("Error deleting lottery Sets:", error.message);
    throw error;
  }
};

async function validateInput(data) {
  if (typeof data !== "object" || Array.isArray(data) || data === null) {
    throw new Error("Input must be a single object.");
  }

  if (!data.lottery_type_id) {
    throw new Error("lottery_type_id is required.");
  }

  if (!Array.isArray(data.betting_options)) {
    throw new Error("betting_options must be an array.");
  }
}

async function validateLotteryType(lotteryTypeId) {
  const exists = await LotteryType.findById(lotteryTypeId);
  if (!exists) {
    throw new Error(`Lottery type not found: ${lotteryTypeId}`);
  }
}

async function validateBettingOptions(options) {
  options.forEach((option, index) => {
    const missingFields = [];

    if (option.payout_rate == null) missingFields.push("payout_rate");
    if (option.min_bet == null) missingFields.push("min_bet");
    if (option.max_bet == null) missingFields.push("max_bet");

    if (missingFields.length) {
      throw new Error(
        `Betting option at index ${index} is missing: ${missingFields.join(
          ", "
        )}`
      );
    }

    if (option.min_bet > option.max_bet) {
      throw new Error(
        `min_bet cannot be greater than max_bet at index ${index}.`
      );
    }
  });
}
