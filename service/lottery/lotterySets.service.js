const LotterySets = require("../../models/lotterySets.model");
const LotteryType = require("../../models/lotteryType.model");
const BettingType = require("../../models/bettingTypes.model");
const mongoose = require("mongoose");

exports.createLotterySets = async function (data) {
  try {
    validateInput(data);
    await validateLotteryType(data.lottery_type_id);
    await validateBettingOptionsAndIds(data.betting_options);

    const createdSet = await LotterySets.create(data);

    return createdSet;
  } catch (error) {
    console.error("Error creating lottery sets:", error.message);
    throw error;
  }
};

exports.getLotterySets = async function (query) {
  try {
    const { status, limit = 10, page = 1, slug } = query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    let lotterySets = await LotterySets.find(filter)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate("lottery_type_id")
      .populate({
        path: "betting_options.betting_type_id",
        model: "BettingTypes",
      });

    if (slug) {
      lotterySets = lotterySets.filter(
        (lottery) => lottery.lottery_type_id?.slug === slug
      );
    }

    const totalItems = await LotterySets.countDocuments(filter);

    return {
      data: lotterySets,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
      },
    };
  } catch (error) {
    throw new Error("Error retrieving lottery sets: " + error.message);
  }
};

exports.getLotteryById = async function (lotteryId) {
  try {
    const lottery = await LotterySets.findById(lotteryId).populate({
      path: "betting_options.betting_type_id",
      model: "BettingTypes",
    });

    if (!lottery) {
      throw new Error("LotterySets not found.");
    }

    return lottery;
  } catch (error) {
    throw new Error("Error retrieving lotterySets: " + error.message);
  }
};

exports.updateLotterySets = async function (lotteryId, data) {
  try {
    const updateData = {};
    Object.keys(data).forEach((key) => {
      let value = data[key];
      if (key === "betting_options") {
        if (
          value === undefined ||
          value === null ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === "string" && value.trim() === "")
        ) {
          return;
        }

        if (Array.isArray(value)) {
          value = value.map((opt) => {
            const filtered = { ...opt };
            Object.keys(filtered).forEach((fkey) => {
              if (filtered[fkey] === "" || filtered[fkey] === null) {
                delete filtered[fkey];
              }
            });
            return filtered;
          });
        }
        updateData[key] = value;
      } else if (typeof value === "string") {
        if (value.trim() !== "") {
          updateData[key] = value;
        }
      } else if (Array.isArray(value)) {
        if (value.length > 0) {
          updateData[key] = value;
        }
      } else if (typeof value === "object" && value !== null) {
        if (Object.keys(value).length > 0) {
          updateData[key] = value;
        }
      } else if (typeof value === "number" || typeof value === "boolean") {
        updateData[key] = value;
      }
    });

    if (Object.keys(updateData).length === 0) {
      throw new Error("No valid fields to update.");
    }

    const updatedLotterySets = await LotterySets.findByIdAndUpdate(
      lotteryId,
      updateData,
      { new: true }
    );

    if (!updatedLotterySets) {
      throw new Error("Lottery not found.");
    }

    return updatedLotterySets;
  } catch (error) {
    console.error("Error updating lottery item:", error.message);
    throw error;
  }
};

exports.deleteAllLottery = async function () {
  try {
    const deletedItems = await LotterySets.deleteMany();
    return deletedItems;
  } catch (error) {
    console.error("Error deleting all lottery Sets:", error.message);
    throw error;
  }
};

exports.deleteLottery = async function (lotteryId) {
  try {
    const deletedLottery = await LotterySets.findByIdAndDelete(lotteryId);
    if (!deletedLottery) {
      throw new Error("Lottery Sets not found.");
    }
    return deletedLottery;
  } catch (error) {
    console.error("Error deleting lottery Sets:", error.message);
    throw error;
  }
};

async function validateInput(data) {
  if (typeof data !== "object" || Array.isArray(data) || data === null) {
    throw new Error("Input must be a single object.");
  }

  if (!data.lottery_type_id) {
    throw new Error("lottery_type_id is required.");
  }

  if (!Array.isArray(data.betting_options)) {
    throw new Error("betting_options must be an array.");
  }
}

async function validateLotteryType(lotteryTypeId) {
  const exists = await LotteryType.findById(lotteryTypeId);
  if (!exists) {
    throw new Error(`Lottery type not found: ${lotteryTypeId}`);
  }
}

async function validateBettingOptionsAndIds(options) {
  if (!Array.isArray(options))
    throw new Error("betting_options must be an array.");

  const errors = [];
  const ids = [];

  options.forEach(({ betting_type_id, payout_rate, min_bet, max_bet }, i) => {
    const missing = [];
    if (!betting_type_id) missing.push("betting_type_id");
    if (payout_rate == null) missing.push("payout_rate");
    if (min_bet == null) missing.push("min_bet");
    if (max_bet == null) missing.push("max_bet");

    if (missing.length)
      errors.push(`Index ${i} missing: ${missing.join(", ")}`);

    if (min_bet != null && max_bet != null && min_bet > max_bet)
      errors.push(`Index ${i}: min_bet cannot be greater than max_bet`);

    if (betting_type_id) ids.push(betting_type_id);
  });

  if (errors.length) throw new Error(errors.join(" | "));

  const uniqueIds = [...new Set(ids.map((id) => id.toString()))];

  for (let i = 0; i < uniqueIds.length; i++) {
    if (!mongoose.Types.ObjectId.isValid(uniqueIds[i]))
      throw new Error(`Invalid betting_type_id format: ${uniqueIds[i]}`);
  }

  const found = await BettingType.find({ _id: { $in: uniqueIds } })
    .select("_id")
    .lean();
  const foundIds = new Set(found.map((f) => f._id.toString()));

  uniqueIds.forEach((id) => {
    if (!foundIds.has(id)) errors.push(`betting_type_id not found: ${id}`);
  });

  if (errors.length) throw new Error(errors.join(" | "));
}
