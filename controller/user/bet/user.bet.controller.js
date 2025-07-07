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
    const response = await handleSuccess(userBet, "แทงหวยสำเร็จ", 201);
    return res.status(201).json(response);
  } catch (error) {
    console.error(error);
    const response = await handleError(error, "เกิดข้อผิดพลาดในการแทงหวย", 400);
    return res.status(response.status).json(response);
  }
};

exports.getUserBetsById = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { lottery_set_id, status } = req.query;

    const bets = await userBetService.getUserBetsById(
      user_id,
      lottery_set_id,
      status
    );

    const response = await handleSuccess(bets, "ดึงข้อมูลการแทงหวยสำเร็จ");
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

    const { bets, pagination } = await userBetService.getAllUserBets(
      page,
      limit
    );

    const response = await handleSuccess(
      { bets },
      "ดึงข้อมูลการแทงหวยสำเร็จ",
      200,
      pagination
    );
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

exports.cancelUserBet = async (req, res) => {
  try {
    const user_id = req.user._id;
    const bet_id = req.params.id;
    const result = await userBetService.cancelUserBet(user_id, bet_id);

    if (!result) {
      return res
        .status(404)
        .json({ message: "ไม่พบข้อมูลการแทงหวยหรือยกเลิกไม่ได้" });
    }

    return res.status(200).json({ message: "ยกเลิกการแทงหวยสำเร็จ", result });
  } catch (error) {
    const response = await handleError(
      error,
      "เกิดข้อผิดพลาดในการยกเลิกการแทงหวย",
      400
    );
    return res.status(response.status).json(response);
  }
};
