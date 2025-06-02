const bettingTypes = require("../../models/bettingTypes.model");
const LotteryType = require("../../models/lotteryType.model");

exports.createBettingType = async ({ name, description, code }) => {
  try {
    const newBettingType = await bettingTypes.create({
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
    const types = await bettingTypes.find();
    return types;
  } catch (error) {
    console.error("Service Error - getBettingTypes:", error.message);
    throw new Error("Failed to retrieve betting types: " + error.message);
  }
};

exports.getBettingTypeById = async (id) => {
  try {
    const bettingType = await bettingTypes.findById(id);

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

exports.getBettingTypesByLotteryTypeId = async (lottery_type_id) => {
  try {
    const types = await bettingTypes
      .find({ lottery_type_id })
      .populate("lottery_type_id");

    if (types.length === 0) {
      throw new Error(
        `No betting types found for lottery type ID ${lottery_type_id}.`
      );
    }

    return types;
  } catch (error) {
    console.error(
      "Service Error - getBettingTypesByLotteryTypeId:",
      error.message
    );
    throw new Error("Failed to retrieve betting types: " + error.message);
  }
};
