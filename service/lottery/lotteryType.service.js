const LotteryType = require("../../models/lotteryType.model");
const LotteryItem = require("../../models/lotterySets.model");
const huay = require("../../models/huay.model");

exports.createLotteryType = async function (data) {
  const newLotteryCategory = new LotteryType(data);
  return await newLotteryCategory.save();
};

exports.getLotteryType = async function () {
  return await LotteryType.find();
};

exports.deleteLotteryCategory = async function (categoryId) {
  try {
    const deletedCategory = await LotteryCategory.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      throw new Error("Lottery category not found.");
    }

    await LotteryItem.deleteMany({ category: categoryId });
    await huay.deleteMany({ lottery_category_id: categoryId });

    return deletedCategory;
  } catch (error) {
    console.error("Error deleting lottery category:", error.message);
    throw error;
  }
};

exports.updateLotteryCategory = async function (categoryId, data) {
  try {
    const updatedCategory = await LotteryCategory.findByIdAndUpdate(
      categoryId,
      data,
      { new: true }
    );

    if (!updatedCategory) {
      throw new Error("Lottery category not found.");
    }

    return updatedCategory;
  } catch (error) {
    console.error("Error updating lottery category:", error.message);
    throw error;
  }
};
