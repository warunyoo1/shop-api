const lotteryTypeService = require("../../service/lottery/lotteryType.service");
const { validateCreateLotteryType } = require("../../validators/Validator");

exports.createLotteryType = async (req, res) => {
  try {
    const { error, value } = validateCreateLotteryType(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.details.map((d) => d.message),
      });
    }

    const created = await lotteryTypeService.createLotteryType(value);
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

exports.UpdateLotteryType = async (req, res) => {
  try {
    const Id = req.params.id;
    const updatedType = await lotteryTypeService.updateLotteryType(
      Id,
      req.body
    );
    if (!updatedType) {
      return res.status(404).json({
        success: false,
        message: "Lottery Type not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lottery Type updated successfully.",
      data: updatedType,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to update lottery Type.",
      error: error.message,
    });
  }
};
