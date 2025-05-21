const LotteryRates = require("../models/lottery_rates.model");

exports.create = async (data) => {
  try {
    if (Array.isArray(data)) {
      return await LotteryRates.insertMany(data);
    } else {
      return await LotteryRates.create(data);
    }
  } catch (error) {
    console.error("LotteryRates Service Error:", error.message);
    throw new Error("Error creating lottery rates: " + error.message);
  }
};
