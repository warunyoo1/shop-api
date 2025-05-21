const huayService = require("../../service/lottery/huay.service");
const axios = require("axios");

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
      lottery_category_id,
      huay_name: huay.huay_name || "",
      huay_number: Array.isArray(huay.huay_number)
        ? huay.huay_number
        : [huay.huay_number],
      reward: huay.reward || "",
    }));

    const result = await huayService.create(payload, lottery_category_id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("CreateHuay Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Unable to create Huay data.",
      error: error.message,
    });
  }
};

exports.createHuayAPI = async (req, res) => {
  try {
    const { lottery_category_id } = req.body;

    if (!lottery_category_id) {
      return res.status(400).json({
        success: false,
        message: "Missing lottery_category_id.",
      });
    }

    const response = await axios.get("https://lotto.api.rayriffy.com/latest");
    const data = response.data?.response;

    if (!data || !data.prizes || !data.runningNumbers) {
      return res.status(400).json({
        success: false,
        message: "No prize or runningNumbers data found from external API.",
      });
    }

    const huayData = [];

    const prizeFirst = data.prizes.find((prize) => prize.id === "prizeFirst");
    if (prizeFirst && Array.isArray(prizeFirst.number)) {
      huayData.push({
        lottery_category_id,
        huay_name: prizeFirst.name,
        huay_number: prizeFirst.number,
        reward: prizeFirst.reward,
      });
    }

    data.runningNumbers.forEach((running) => {
      if (Array.isArray(running.number)) {
        huayData.push({
          lottery_category_id,
          huay_name: running.name,
          huay_number: running.number,
          reward: running.reward,
        });
      }
    });

    if (!huayData.length) {
      return res.status(400).json({
        success: false,
        message: "No valid huay data to insert.",
      });
    }

    const result = await huayService.create(huayData, lottery_category_id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("CreateHuay Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Unable to create Huay data.",
      error: error.message,
    });
  }
};

exports.getHuay = async (req, res) => {
  try {
    const huays = await huayService.getHuay();
    return res.status(200).json({
      success: true,
      message: "Huay data retrieved successfully.",
      data: huays,
    });
  } catch (error) {
    console.error("GetHuay Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Unable to retrieve Huay data.",
      error: error.message,
    });
  }
};

exports.getHuayById = async (req, res) => {
  try {
    const huayId = req.params.id;
    const huay = await huayService.getHuayById(huayId);
    if (!huay) {
      return res.status(404).json({
        success: false,
        message: "Huay data not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Huay data retrieved successfully.",
      data: huay,
    });
  } catch (error) {
    console.error("GetHuayById Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Unable to retrieve Huay data.",
      error: error.message,
    });
  }
};

exports.updateHuay = async (req, res) => {
  try {
    const huayId = req.params.id;
    const updatedHuay = await huayService.updateHuay(huayId, req.body);
    if (!updatedHuay) {
      return res.status(404).json({
        success: false,
        message: "Huay data not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Huay data updated successfully.",
      data: updatedHuay,
    });
  } catch (error) {
    console.error("UpdateHuay Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Unable to update Huay data.",
      error: error.message,
    });
  }
};
