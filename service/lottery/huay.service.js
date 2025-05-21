const huay = require("../../models/huay.model");
const LotteryCategory = require("../../models/lotteryCategory.model");
const LotteryItem = require("../../models/lotteryItem.model");

exports.create = async (data, lottery_item_id) => {
  try {
    const category = await LotteryItem.findById(lottery_item_id);
    if (!category) {
      throw new Error("Invalid lottery_item_id : Category not found.");
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
