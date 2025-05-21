const lotteryService = require("../../service/lottery/lottery.service");

exports.createLottery = async (req, res) => {
  try {
    const created = await lotteryService.createLottery(req.body);
    return res.status(201).json({
      success: true,
      message: "Lottery items created successfully.",
      data: created,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to create lottery items.",
      error: error.message,
    });
  }
};

exports.getLottery = async (req, res) => {
  try {
    const lotteries = await lotteryService.getLottery();
    return res.status(200).json({
      success: true,
      message: "Lottery items retrieved successfully.",
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

exports.getLotteryById = async (req, res) => {
  try {
    const lotteryId = req.params.id;
    const lottery = await lotteryService.getLotteryById(lotteryId);
    if (!lottery) {
      return res.status(404).json({
        success: false,
        message: "Lottery item not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lottery item retrieved successfully.",
      data: lottery,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to retrieve lottery item.",
      error: error.message,
    });
  }
};

exports.updateLottery = async (req, res) => {
  try {
    const lotteryId = req.params.id;
    const updatedLottery = await lotteryService.updateLottery(
      lotteryId,
      req.body
    );
    if (!updatedLottery) {
      return res.status(404).json({
        success: false,
        message: "Lottery item not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lottery item updated successfully.",
      data: updatedLottery,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to update lottery item.",
      error: error.message,
    });
  }
};

exports.deleteAllLottery = async (req, res) => {
  try {
    const deletedItems = await lotteryService.deleteAllLottery();
    return res.status(200).json({
      success: true,
      message: "All lottery items deleted successfully.",
      data: deletedItems,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to delete all lottery items.",
      error: error.message,
    });
  }
};

exports.deleteLottery = async (req, res) => {
  try {
    const lotteryId = req.params.id;
    const deletedLottery = await lotteryService.deleteLottery(lotteryId);
    if (!deletedLottery) {
      return res.status(404).json({
        success: false,
        message: "Lottery item not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lottery item deleted successfully.",
      data: deletedLottery,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to delete lottery item.",
      error: error.message,
    });
  }
};
