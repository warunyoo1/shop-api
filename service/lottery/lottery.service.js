const LotteryItem = require("../../models/lotteryItem.model");


exports.createLottery = async function (data) {
  const newLottery = new LotteryItem(data);
  return await newLottery.save();
};
