const mongoose = require("mongoose");
const moment = require("moment-timezone");
const Withdrawal = require("../../models/withdrawal.models");
const User = require("../../models/user.model");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

// สร้างคำขอถอนเงิน
exports.createWithdrawal = async function ({
  user_id,
  amount,
  bank_name,
  bank_number,
  account_name,
  description,
}) {
  try {
    // เช็คว่า user_id มีอยู่ในฐานข้อมูลหรือไม่
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("ไม่พบผู้ใช้งานในระบบ");
    }
   
    // เช็คว่า amount มีค่ามากกว่า 0 หรือไม่
    if (amount <= 0) {
      throw new Error("จำนวนเงินต้องมากกว่า 0");
    }

    // เช็คว่า user มีเงินเพียงพอหรือไม่
    if (user.credit < amount) {
      throw new Error("เงินในบัญชีไม่เพียงพอ");
    }

    // คำนวณค่าธรรมเนียม (ตัวอย่าง: 3% ของจำนวนเงิน)
    const fee = amount * 0.03;
    const netAmount = amount - fee;

    // สร้างข้อมูล withdrawal ใหม่
    const newWithdrawal = new Withdrawal({
      user_id: user._id,
      amount,
      netAmount,
      fee,
      bank_name,
      bank_number,
      account_name,
      description,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // บันทึกข้อมูล
    await newWithdrawal.save();

    // หักเงินจาก user ทันที
    user.credit -= amount;
    await user.save();

    return newWithdrawal;

  } catch (error) {
    throw error;
  }
};

// อนุมัติการถอนเงิน
exports.approveWithdrawal = async function ({
  id,
  approvedBy,
}) {
  try {
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      throw new Error("ไม่พบข้อมูลการถอนเงิน");
    }

    if (withdrawal.status !== 'pending') {
      throw new Error("ไม่สามารถอนุมัติได้ เนื่องจากสถานะไม่ใช่ pending");
    }

    // อัพเดทสถานะเป็น approved
    withdrawal.status = 'approved';
    withdrawal.approvedBy = approvedBy;
    withdrawal.approvedAt = new Date();
    withdrawal.updated_at = new Date();
    await withdrawal.save();

    return withdrawal;
  } catch (error) {
    throw error;
  }
};

// ปฏิเสธการถอนเงิน
exports.rejectWithdrawal = async function ({
  id,
  rejectedReason,
  approvedBy,
}) {
  try {
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      throw new Error("ไม่พบข้อมูลการถอนเงิน");
    }

    if (withdrawal.status !== 'pending') {
      throw new Error("ไม่สามารถปฏิเสธได้ เนื่องจากสถานะไม่ใช่ pending");
    }

    // อัพเดทสถานะเป็น rejected
    withdrawal.status = 'rejected';
    withdrawal.rejectedReason = rejectedReason;
    withdrawal.approvedBy = approvedBy;
    withdrawal.updated_at = new Date();
    await withdrawal.save();

    // คืนเงินให้ user
    const user = await User.findById(withdrawal.user_id);
    if (!user) {
      throw new Error("ไม่พบข้อมูลผู้ใช้");
    }
    user.credit += withdrawal.amount;
    await user.save();

    return withdrawal;
  } catch (error) {
    throw error;
  }
};

// ยืนยันการโอนเงินสำเร็จ
exports.completeWithdrawal = async function ({
  id,
  approvedBy,
}) {
  try {
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      throw new Error("ไม่พบข้อมูลการถอนเงิน");
    }

    if (withdrawal.status !== 'approved') {
      throw new Error("ไม่สามารถยืนยันได้ เนื่องจากสถานะไม่ใช่ approved");
    }

    // อัพเดทสถานะเป็น completed
    withdrawal.status = 'completed';
    withdrawal.updated_at = new Date();
    await withdrawal.save();

    return withdrawal;
  } catch (error) {
    throw error;
  }
};

// ดึงข้อมูลตาม id
exports.getWithdrawalById = async (id) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของรายการถอนเงิน", 400);
    }

    return await Withdrawal.findById(id).populate('user_id', 'username');
  } catch (error) {
    return handleError(error);
  }
};

// ดึงข้อมูลทั้งหมด
exports.getAllWithdrawals = async function ({ page = 1, limit = 10, status } = {}) {
  const skip = (page - 1) * limit;
  
  let query = {};
  if (status) {
    query.status = status;
  }

  const withdrawals = await Withdrawal.find(query)
    .populate('user_id', 'username')
    .populate('approvedBy', 'username')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Withdrawal.countDocuments(query);

  return {
    data: withdrawals,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ดึงข้อมูลการถอนเงินของ user
exports.getWithdrawalsByUserId = async function (user_id, { page = 1, limit = 10 } = {}) {
  const skip = (page - 1) * limit;
  
  const withdrawals = await Withdrawal.find({ user_id })
    .populate('approvedBy', 'username')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Withdrawal.countDocuments({ user_id });

  return {
    data: withdrawals,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ถอนเงินจาก admin   ถ้าหักจาก admin  ถือว่า success  ไปเลย
exports.deductFromAdmin = async function ({
  user_id,
  amount,
  bank_name,
  bank_number,
  account_name,
  description,
  addcredit_admin_id,
  addcredit_admin_name,
  addcredit_admin_role,
}) {
  try {
    // เช็คว่า user_id มีอยู่ในฐานข้อมูลหรือไม่
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("ไม่พบผู้ใช้งานในระบบ");
    }
   
    // เช็คว่า amount มีค่ามากกว่า 0 หรือไม่
    if (amount <= 0) {
      throw new Error("จำนวนเงินต้องมากกว่า 0");
    }


    // คำนวณค่าธรรมเนียม (ตัวอย่าง: 3% ของจำนวนเงิน)
    const fee = amount * 0.03;
    const netAmount = amount - fee;

    // สร้างข้อมูล withdrawal ใหม่
    const newWithdrawal = new Withdrawal({
      user_id: user._id,
      amount,
      netAmount,
      fee,
      bank_name,
      bank_number,
      account_name,
      description,
      status: 'completed', // ถ้าหักจาก admin ถือว่า success ไปเลย
      approvedBy: addcredit_admin_id,
      approvedAt: new Date(),
      addcredit_admin_id: addcredit_admin_id,
      addcredit_admin_name: addcredit_admin_name,
      addcredit_admin_role: addcredit_admin_role,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // บันทึกข้อมูล withdrawal
    await newWithdrawal.save();

    // หักเงินจาก user ทันที
    user.credit -= amount;
    await user.save();
  

    return newWithdrawal;

  } catch (error) {
    throw error;
  }
};

// อัพเดทข้อมูลการถอนเงิน
exports.updateWithdrawal = async function ({
  id,
  bank_name,
  bank_number,
  account_name,
  description,
}) {
  try {
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      throw new Error("ไม่พบข้อมูลการถอนเงิน");
    }

    if (withdrawal.status !== 'pending') {
      throw new Error("ไม่สามารถแก้ไขได้ เนื่องจากสถานะไม่ใช่ pending");
    }

    // อัพเดทข้อมูล
    withdrawal.bank_name = bank_name || withdrawal.bank_name;
    withdrawal.bank_number = bank_number || withdrawal.bank_number;
    withdrawal.account_name = account_name || withdrawal.account_name;
    withdrawal.description = description || withdrawal.description;
    withdrawal.updated_at = new Date();

    await withdrawal.save();

    return withdrawal;
  } catch (error) {
    throw error;
  }
};

// ยกเลิกการถอนเงิน
exports.cancelWithdrawal = async function ({
  id,
}) {
  try {
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      throw new Error("ไม่พบข้อมูลการถอนเงิน");
    }

    if (withdrawal.status !== 'pending') {
      throw new Error("ไม่สามารถยกเลิกได้ เนื่องจากสถานะไม่ใช่ pending");
    }

    // อัพเดทสถานะเป็น cancelled
    withdrawal.status = 'cancelled';
    withdrawal.updated_at = new Date();
    await withdrawal.save();

    // คืนเงินให้ user
    const user = await User.findById(withdrawal.user_id);
    if (!user) {
      throw new Error("ไม่พบข้อมูลผู้ใช้");
    }
    user.credit += withdrawal.amount;
    await user.save();

    return withdrawal;
  } catch (error) {
    throw error;
  }
};

// ลบการถอนเงิน
exports.deleteWithdrawal = async function ({
  id,
}) {
  try {
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      throw new Error("ไม่พบข้อมูลการถอนเงิน");
    }

    // ถ้าสถานะเป็น pending ให้คืนเงิน
    if (withdrawal.status === 'pending') {
      const user = await User.findById(withdrawal.user_id);
      if (!user) {
        throw new Error("ไม่พบข้อมูลผู้ใช้");
      }
      user.credit += withdrawal.amount;
      await user.save();
    }

    // ลบข้อมูล withdrawal
    await Withdrawal.findByIdAndDelete(id);

    return { message: "ลบข้อมูลการถอนเงินสำเร็จ" };
  } catch (error) {
    throw error;
  }
};

exports.getWithdrawals = async ({ page = 1, perPage = 10, search }) => {
  try {
    const query = {};
    if (search) {
      query.$or = [
        { 'user_id.username': { $regex: search, $options: 'i' } },
      ];
    }

    const withdrawals = await Withdrawal.find(query)
      .populate('user_id', 'username')
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    const total = await Withdrawal.countDocuments(query);

    const pagination = {
      currentPage: page,
      perPage,
      totalItems: total,
      totalPages: Math.ceil(total / perPage),
    };

    return handleSuccess(withdrawals, "ดึงข้อมูลรายการถอนเงินสำเร็จ", 200, pagination);
  } catch (error) {
    return handleError(error);
  }
}; 