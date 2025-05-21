const huay = require("../../models/huay.model");
const LotteryCategory = require("../../models/lotteryCategory.model");

exports.create = async (data, lottery_category_id) => {
  try {
    const category = await LotteryCategory.findById(lottery_category_id);
    if (!category) {
      throw new Error("Invalid lottery_category_id: Category not found.");
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
