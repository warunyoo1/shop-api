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

exports.GetLotteryCategory = async (req, res) => {
  try {
    const categories = await lotteryCategoryService.getLotteryCategory();
    return res.status(200).json({
      success: true,
      message: "Lottery categories retrieved successfully.",
      data: categories,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to retrieve lottery categories.",
      error: error.message,
    });
  }
};

exports.DeleteLotteryCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const deletedCategory = await lotteryCategoryService.deleteLotteryCategory(
      categoryId
    );
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Lottery category not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lottery category deleted successfully.",
      data: deletedCategory,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to delete lottery category.",
      error: error.message,
    });
  }
};

exports.UpdateLotteryCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const updatedCategory = await lotteryCategoryService.updateLotteryCategory(
      categoryId,
      req.body
    );
    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Lottery category not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lottery category updated successfully.",
      data: updatedCategory,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to update lottery category.",
      error: error.message,
    });
  }
};
