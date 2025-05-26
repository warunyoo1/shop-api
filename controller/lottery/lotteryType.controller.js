const lotteryTypeService = require("../../service/lottery/lotteryType.service");

exports.createLotteryType = async (req, res) => {
  try {
    const created = await lotteryTypeService.createLotteryType(req.body);
    return res.status(201).json({
      success: true,
      message: "Lottery Type  created successfully.",
      data: created,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to create lottery Type .",
      error: error.message,
    });
  }
};

exports.GetLotteryType = async (req, res) => {
  try {
    const type = await lotteryTypeService.getLotteryType();
    return res.status(200).json({
      success: true,
      message: "Lottery Type retrieved successfully.",
      data: type,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to retrieve lottery Type.",
      error: error.message,
    });
  }
};

exports.DeleteLotteryType = async (req, res) => {
  try {
    const typeId = req.params.id;
    const deletedType = await lotteryTypeService.deleteLotteryType(typeId);
    if (!deletedType) {
      return res.status(404).json({
        success: false,
        message: "Lottery Type not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lottery Type deleted successfully.",
      data: deletedType,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to delete lottery Type.",
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
