const lotteryCategoryService = require("../../service/lottery/lotteryCategory.service");

exports.createLotteryCategory = async (req, res) => {
  try {
    const created = await lotteryCategoryService.createLotteryCategory(
      req.body
    );
    return res.status(201).json({
      success: true,
      message: "Lottery category created successfully.",
      data: created,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to create lottery category.",
      error: error.message,
    });
  }
};
