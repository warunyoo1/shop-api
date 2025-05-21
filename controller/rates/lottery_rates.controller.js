const lotteryRatesService = require("../rates/lottery_rates.service");

exports.createRates = async (req, res) => {
  try {
    const { name, rate } = req.body;

    if (!name || rate === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing name or rate.",
      });
    }

    const result = await lotteryRatesService.create({ name, rate });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("CreateRates Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Unable to create Rates data.",
      error: error.message,
    });
  }
};
