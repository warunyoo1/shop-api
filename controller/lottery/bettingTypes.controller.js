const bettingTypesService = require("../../service/lottery/bettingType.service");
const {
  createBettingTypeSchema,
  updateBettingTypeSchema,
} = require("../../validators/Validator");

exports.createBettingType = async (req, res) => {
  try {
    const { error, value } = createBettingTypeSchema(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.details.map((d) => d.message),
      });
    }

    const createdBettingType = await bettingTypesService.createBettingType(
      value
    );

    return res.status(201).json({
      success: true,
      message: "Betting type created successfully.",
      data: createdBettingType,
    });
  } catch (error) {
    console.error("Create Betting Type Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Failed to create betting type.",
      error: error.message,
    });
  }
};

exports.getBettingTypes = async (req, res) => {
  try {
    const bettingTypes = await bettingTypesService.getBettingTypes();
    return res.status(200).json({
      success: true,
      message: "Betting types retrieved successfully.",
      data: bettingTypes,
    });
  } catch (error) {
    console.error("Get Betting Types Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Failed to retrieve betting types.",
      error: error.message,
    });
  }
};

exports.getBettingTypeById = async (req, res) => {
  try {
    const bettingTypeId = req.params.id;
    const bettingType = await bettingTypesService.getBettingTypeById(
      bettingTypeId
    );
    if (!bettingType) {
      return res.status(404).json({
        success: false,
        message: "Betting type not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Betting type retrieved successfully.",
      data: bettingType,
    });
  } catch (error) {
    console.error("Get Betting Type By Id Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Failed to retrieve betting type.",
      error: error.message,
    });
  }
};

exports.updateBettingType = async (req, res) => {
  try {
    const bettingTypeId = req.params.id;
    const { error, value } = updateBettingTypeSchema(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.details.map((d) => d.message),
      });
    }

    const updatedBettingType = await bettingTypesService.updateBettingType(
      bettingTypeId,
      value
    );

    if (!updatedBettingType) {
      return res.status(404).json({
        success: false,
        message: "Betting type not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Betting type updated successfully.",
      data: updatedBettingType,
    });
  } catch (error) {
    console.error("Update Betting Type Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Failed to update betting type.",
      error: error.message,
    });
  }
};

exports.deleteBettingTypeById = async (req, res) => {
  try {
    const bettingTypeId = req.params.id;

    const deletedBettingType = await bettingTypesService.deleteBettingTypeById(
      bettingTypeId
    );

    if (!deletedBettingType) {
      return res.status(404).json({
        success: false,
        message: "Betting type not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Betting type deleted successfully.",
      data: deletedBettingType,
    });
  } catch (error) {
    console.error("Controller Error - deleteBettingTypeById:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete betting type.",
      error: error.message,
    });
  }
};

exports.getBettingTypeByLotteryType = async (req, res) => {
  try {
    const lotteryTypeId = req.params.id;

    const bettingTypes =
      await bettingTypesService.getBettingTypesByLotteryTypeId(lotteryTypeId);

    if (!bettingTypes || bettingTypes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No betting types found for this lottery type.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Betting types retrieved successfully.",
      data: bettingTypes,
    });
  } catch (error) {
    console.error("Get Betting Type By Lottery Type Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Failed to retrieve betting types.",
      error: error.message,
    });
  }
};
