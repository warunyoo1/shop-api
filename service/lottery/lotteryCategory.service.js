const LotteryCategory = require("../../models/lotteryCategory.model");

exports.createLotteryCategory = async function (data) {
  const newLotteryCategory = new LotteryCategory(data);
  return await newLotteryCategory.save();
};
