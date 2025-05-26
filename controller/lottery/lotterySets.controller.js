const lotteryService = require("../../service/lottery/lotterySets.service");

exports.createLotterySets = async (req, res) => {
  try {
    const created = await lotteryService.createLotterySets(req.body);
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

exports.getLotterySets = async (req, res) => {
  try {
    const lotteries = await lotteryService.getLotterySets();
    return res.status(200).json({
      success: true,
      message: "Lottery Sets retrieved successfully.",
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

exports.getLotterySetsById = async (req, res) => {
  try {
    const lotteryId = req.params.id;
    const lottery = await lotteryService.getLotteryById(lotteryId);
    if (!lottery) {
      return res.status(404).json({
        success: false,
        message: "Lottery Sets not found.",
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

exports.updateLotterySets = async (req, res) => {
  try {
    const lotteryId = req.params.id;
    const updatedLotterySets = await lotteryService.updateLotterySets(
      lotteryId,
      req.body
    );
    if (!updatedLotterySets) {
      return res.status(404).json({
        success: false,
        message: "LotterySets not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "LotterySets updated successfully.",
      data: updatedLotterySets,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to update LotterySets.",
      error: error.message,
    });
  }
};

exports.deleteAllLotterySets = async (req, res) => {
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
        message: "Lottery Sets not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lottery Sets deleted successfully.",
      data: deletedLottery,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to delete lottery Sets.",
      error: error.message,
    });
  }
};
