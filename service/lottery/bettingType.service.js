const bettingTypes = require("../../models/bettingTypes.model");
const LotteryType = require("../../models/lotteryType.model");

exports.createBettingType = async ({
  name,
  description,
  code,
  lottery_type_id,
}) => {
  try {
    if (!lottery_type_id || !name || !description) {
      throw new Error(
        "Missing required fields: lottery_type_id, name, or description."
      );
    }

    const exists = await LotteryType.findById(lottery_type_id);
    if (!exists) {
      throw new Error(
        `Lottery type with ID ${lottery_type_id} does not exist.`
      );
    }

    const newBettingType = await bettingTypes.create({
      lottery_type_id,
      name,
      description,
      code,
    });

    return newBettingType;
  } catch (error) {
    console.error("Service Error - createBettingType:", error.message);
    throw new Error("Failed to create betting type: " + error.message);
  }
};

exports.getBettingTypes = async () => {
  try {
    const types = await bettingTypes.find().populate("lottery_type_id");
    return types;
  } catch (error) {
    console.error("Service Error - getBettingTypes:", error.message);
    throw new Error("Failed to retrieve betting types: " + error.message);
  }
};

exports.getBettingTypeById = async (id) => {
  try {
    const bettingType = await bettingTypes
      .findById(id)
      .populate("lottery_type_id");

    if (!bettingType) {
      throw new Error(`Betting type with ID ${id} not found.`);
    }

    return bettingType;
  } catch (error) {
    console.error("Service Error - getBettingTypeById:", error.message);
    throw new Error("Failed to retrieve betting type: " + error.message);
  }
};

exports.updateBettingType = async (id, data) => {
  try {
    const updatedBettingType = await bettingTypes.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!updatedBettingType) {
      throw new Error(`Betting type with ID ${id} not found.`);
    }

    return updatedBettingType;
  } catch (error) {
    console.error("Service Error - updateBettingType:", error.message);
    throw new Error("Failed to update betting type: " + error.message);
  }
};

exports.deleteBettingTypeById = async (id) => {
  try {
    const deletedBettingType = await bettingTypes.findByIdAndDelete(id);

    if (!deletedBettingType) {
      throw new Error(`Betting type with ID ${id} not found.`);
    }

    return deletedBettingType;
  } catch (error) {
    console.error("Service Error - deleteBettingType:", error.message);
    throw new Error("Failed to delete betting type: " + error.message);
  }
};
