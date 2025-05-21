const huayService = require("../../service/lottery/huay.service");

exports.createHuay = async (req, res) => {
  try {
    const { lottery_category_id, huays } = req.body;

    if (!lottery_category_id || !Array.isArray(huays) || !huays.length) {
      return res.status(400).json({
        success: false,
        message: "Missing lottery_category_id or huay data.",
      });
    }

    const payload = huays.map((huay) => ({
      ...huay,
      lottery_category_id,
    }));

    const result = await huayService.create(payload, lottery_category_id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("CreateHuay Error:", error.message);
    res.status(400).json({
      success: false,
      message: "Unable to create Huay data.",
      error: error.message,
    });
  }
};
