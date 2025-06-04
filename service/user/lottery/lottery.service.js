const LotterySets = require("../../../models/lotterySets.model");

exports.getLotteryUserSets = async function (query) {
  try {
    const { status, limit, slug } = query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    let lotterySets = await LotterySets.find(filter)
      .limit(parseInt(limit) || 10)
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
    return lotterySets;
  } catch (error) {
    throw new Error("Error retrieving lottery sets: " + error.message);
  }
};

exports.getLotteryUserSetsById = async function (lotteryId) {
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
