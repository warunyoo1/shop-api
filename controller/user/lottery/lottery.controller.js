const userService = require("../../../service/user/lottery/lottery.service");

exports.getLotteryUserSets = async (req, res) => {
  try {
    const lotteries = await userService.getLotteryUserSets(req.query);
    return res.status(200).json({
      success: true,
      message: "Lottery Sets User retrieved successfully.",
      data: lotteries,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to retrieve lottery items.",
      error: error.message,
    });
  }
};

exports.getLotteryUserSetsById = async (req, res) => {
  try {
    const lotteryId = req.params.id;
    const lottery = await userService.getLotteryUserSetsById(lotteryId);
    if (!lottery) {
      return res.status(404).json({
        success: false,
        message: "Lottery Sets User not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lottery Sets retrieved successfully.",
      data: lottery,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to retrieve lottery Sets.",
      error: error.message,
    });
  }
};
