const userBetService = require("../../../service/user/bet/user.bet.service");

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
