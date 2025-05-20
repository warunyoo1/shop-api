const e = require("express");
const LotteryCategory = require("../../models/lotteryCategory.model");
const LotteryItem = require("../../models/lotteryItem.model");

exports.createLotteryCategory = async function (data) {
  const newLotteryCategory = new LotteryCategory(data);
  return await newLotteryCategory.save();
};

exports.getLotteryCategory = async function () {
  return await LotteryCategory.find();
};

exports.deleteLotteryCategory = async function (categoryId) {
  try {
    const deletedCategory = await LotteryCategory.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      throw new Error("Lottery category not found.");
    }

    await LotteryItem.deleteMany({ category: categoryId });

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
