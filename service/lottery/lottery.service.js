const LotterySets = require("../../models/lotterySets.model");
const LotteryType = require("../../models/lotteryType.model");

exports.createLotterySets = async function (data) {
  try {
    if (typeof data !== "object" || Array.isArray(data) || data === null) {
      throw new Error("Input must be a single object.");
    }

    console.log("Creating lottery Sets with data:", data);
    if (!data.lottery_type_id) {
      throw new Error("type ID is required.");
    }

    const existingType = await LotteryType.findById(data.lottery_type_id);
    if (!existingType) {
      throw new Error(`Lottery type not found: ${data.lottery_type_id}`);
    }

    const createdItem = await LotterySets.create(data);
    return createdItem;
  } catch (error) {
    console.error("Error creating lottery Sets:", error.message);
    throw error;
  }
};

exports.getLotterySets = async function () {
  return await LotterySets.find();
};

exports.getLotteryById = async function (lotteryId) {
  try {
    const lottery = await LotteryItem.findById(lotteryId);
    if (!lottery) {
      throw new Error("Lottery item not found.");
    }
    return lottery;
  } catch (error) {
    throw new Error("Error retrieving lottery item: " + error.message);
  }
};

exports.updateLottery = async function (lotteryId, data) {
  try {
    const updatedLotteryItem = await LotteryItem.findByIdAndUpdate(
      lotteryId,
      data,
      { new: true }
    );

    if (!updatedLotteryItem) {
      throw new Error("Lottery not found.");
    }

    return updatedLotteryItem;
  } catch (error) {
    console.error("Error updating lottery item:", error.message);
    throw error;
  }
};

exports.deleteAllLottery = async function () {
  try {
    const deletedItems = await LotteryItem.deleteMany();
    return deletedItems;
  } catch (error) {
    console.error("Error deleting all lottery items:", error.message);
    throw error;
  }
};

exports.deleteLottery = async function (lotteryId) {
  try {
    const deletedLottery = await LotteryItem.findByIdAndDelete(lotteryId);
    if (!deletedLottery) {
      throw new Error("Lottery item not found.");
    }
    return deletedLottery;
  } catch (error) {
    console.error("Error deleting lottery item:", error.message);
    throw error;
  }
};
