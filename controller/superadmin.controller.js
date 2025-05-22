// active user
exports.activeUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await superadminService.activeUser(userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเปิดใช้งานผู้ใช้",
      error: error.message
    });
  }
};

// disactive user
exports.disactiveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await superadminService.disactiveUser(userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการปิดใช้งานผู้ใช้",
      error: error.message
    });
  }
}; 