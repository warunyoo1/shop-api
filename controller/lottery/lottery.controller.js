const lotteryService = require("../../service/lottery/lottery.service");

exports.createLottery = async (req, res) => {
  try {
    const created = await lotteryService.createLottery(req.body);
    return res.status(201).json({
      success: true,
      message: "Lottery item created successfully.",
      data: created,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to create lottery item.",
      error: error.message,
    });
  }
};
