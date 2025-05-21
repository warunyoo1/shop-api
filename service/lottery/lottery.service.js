const LotteryItem = require("../../models/lotteryItem.model");
const LotteryCategory = require("../../models/lotteryCategory.model");

exports.createLottery = async function (dataArray) {
  try {
    if (!Array.isArray(dataArray)) {
      throw new Error("Input must be an array.");
    }

    for (const data of dataArray) {
      if (!data.category) {
        throw new Error("Category ID is required for all lottery items.");
      }

      const existingCategory = await LotteryCategory.findById(data.category);
      if (!existingCategory) {
        throw new Error(`Lottery category not found: ${data.category}`);
      }
    }

    return await LotteryItem.insertMany(dataArray);
  } catch (error) {
    console.error("Error creating lottery items:", error.message);
    throw error;
  }
};

exports.getLottery = async function () {
  return await LotteryItem.find();
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
