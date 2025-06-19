const userBetService = require("../../../service/user/bet/user.bet.service");
const {
  handleSuccess,
  handleError,
} = require("../../../utils/responseHandler");

exports.createUserBet = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { lottery_set_id, bets } = req.body;

    const userBet = await userBetService.createUserBet(
      user_id,
      lottery_set_id,
      bets
    );

    return res.status(201).json({ message: "แทงหวยสำเร็จ", userBet });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ error: error.message || "เกิดข้อผิดพลาดในการแทงหวย" });
  }
};

exports.getUserBetsById = async (req, res) => {
  try {
    const user_id = req.user._id;

    const bets = await userBetService.getUserBetsById(user_id);

    const response = await handleSuccess({ bets }, "ดึงข้อมูลการแทงหวยสำเร็จ");
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(
      error,
      "เกิดข้อผิดพลาดในการดึงข้อมูลการแทงหวย",
      400
    );
    return res.status(response.status).json(response);
  }
};

exports.getUserBetAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    console.log("Page:", page, "Limit:", limit);
    

    const { bets, pagination } = await userBetService.getAllUserBets(page, limit);

    const response = await handleSuccess({ bets }, "ดึงข้อมูลการแทงหวยสำเร็จ", 200, pagination);
    return res.status(response.status).json(response);
  } catch (error) {
    const response = await handleError(
      error,
      "เกิดข้อผิดพลาดในการดึงข้อมูลการแทงหวย",
      400
    );
    return res.status(response.status).json(response);
  }
};
