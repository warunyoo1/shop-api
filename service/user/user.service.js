const mongoose = require("mongoose");
const User = require("../../models/user.model");
const Master = require("../../models/master.model");
const PasswordHistory = require("../../models/history.chang.password.model");
const ForgotPasswordRequest = require("../../models/forgotPasswordRequest.model");
const { generateReferralCode } = require("../../utils/utils");
const {
  handleSuccess,
  handleError,
  formatCreateUserResponse,
} = require("../../utils/responseHandler");
const bcrypt = require("bcrypt");

exports.registerUser = async ({
  full_name,
  username,
  phone,
  master_id = null,
  bank_name,
  bank_number,
  user_id = null,
}) => {
  try {
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return handleError(null, "เบอร์โทรนี้มีอยุ่ในระบบเเล้ว", 400);
    }
    const existingBank = await User.findOne({ bank_number });
    if (existingBank) {
      return handleError(null, "เลขบัญชีนี้มีอยู่ในระบบแล้ว", 400);
    }

    if (master_id) {
      const isValid = mongoose.Types.ObjectId.isValid(master_id);
      if (!isValid) {
        return handleError(null, "master_id ไม่ถูกต้อง", 400);
      }

      const master = await Master.findById(master_id);
      if (!master) {
        return handleError(null, "ไม่พบ Master ที่ระบุ", 404);
      }
    }

    let referralByCode = null;
    let referral_user_id = null;
    if (user_id) {
      const parts = user_id.trim().split("/");
      const referralCode = parts[parts.length - 1];
      const refUser = await User.findOne({ referral_code: referralCode });
      if (!refUser) {
        return handleError(null, "ไม่พบรหัสแนะนำนี้", 404);
      }

      referralByCode = refUser.referral_code;
      referral_user_id = refUser._id;
    }

    const referral_code = await generateReferralCode();

    const user = new User({
      full_name,
      username: phone,
      password: phone,
      phone,
      master_id,
      bank_name,
      bank_number,
      referral_code: referral_code,
      referral_by: referralByCode,
      referral_user_id: referral_user_id,
    });
    const savedUser = await user.save();
    const responseData = await formatCreateUserResponse(savedUser);

    return handleSuccess(responseData, "สมัครสมาชิกสำเร็จ", 201);
  } catch (error) {
    return handleError(error);
  }
};

// get all user
exports.getuser = async ({ page = 1, perpage = 10, search }) => {
  try {
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * perpage;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perpage),
      User.countDocuments(query),
    ]);

    const pagination = {
      currentPage: parseInt(page),
      perPage: parseInt(perpage),
      totalItems: total,
      totalPages: Math.ceil(total / perpage),
    };

    return handleSuccess(users, "ดึงข้อมูล User สำเร็จ", 200, pagination);
  } catch (error) {
    return handleError(error);
  }
};

// get user by id
exports.getUserById = async (userId) => {
  try {
    if (!userId) {
      return handleError(null, "กรุณาระบุ ID ของ User", 400);
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return handleError(null, "ไม่พบ User", 404);
    }

    return handleSuccess(user, "ดึงข้อมูล User สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

// update user
exports.updateUser = async (userId, updateData, currentUser) => {
  try {
    if (!userId) {
      return handleError(null, "กรุณาระบุ ID ของ User", 400);
    }

    // ตรวจสอบ username ซ้ำ
    if (updateData.username) {
      const existingUser = await User.findOne({
        username: updateData.username,
        _id: { $ne: userId },
      });

      if (existingUser) {
        return handleError(null, "Username นี้มีอยู่ในระบบแล้ว", 400);
      }
    }

    const now = new Date();

    if (updateData.password) {
      const user = await User.findById(userId);
      if (!user) {
        return handleError(null, "ไม่พบ User ที่ต้องการแก้ไข", 404);
      }

      const hashedPassword = await bcrypt.hash(updateData.password, 10);

      await User.findByIdAndUpdate(userId, {
        $set: {
          ...updateData,
          password: hashedPassword,
          last_password_change: {
            date: now,
            changed_by: {
              user_id: currentUser.user_id,
              role: currentUser.role,
              full_name: currentUser.full_name,
            },
          },
        },
      });

      const passwordHistoryLatest = await PasswordHistory.findOne({
        user_id: userId,
      }).sort({ changed_at: -1 });

      if (
        passwordHistoryLatest &&
        passwordHistoryLatest.user_id.toString() === userId.toString()
      ) {
        await PasswordHistory.updateOne(
          { _id: passwordHistoryLatest._id },
          {
            $push: {
              changed_by: {
                user_id: currentUser.user_id,
                role: currentUser.role,
                full_name: currentUser.full_name,
                changed_at: now,
              },
              last_password_change: {
                date: now,
                password: user.password,
                changed_by: {
                  user_id: currentUser.user_id,
                  role: currentUser.role,
                  full_name: currentUser.full_name,
                },
              },
            },
            $set: { changed_at: now },
          }
        );
      } else {
        await PasswordHistory.create({
          user_id: userId,
          password: hashedPassword,
          changed_by: [
            {
              user_id: currentUser.user_id,
              role: currentUser.role,
              full_name: currentUser.full_name,
              changed_at: now,
            },
          ],
          last_password_change: [
            {
              date: now,
              password: user.password,
              changed_by: {
                user_id: currentUser.user_id,
                role: currentUser.role,
                full_name: currentUser.full_name,
              },
            },
          ],
          changed_at: now,
        });
      }

      const updatedUser = await User.findById(userId).select("-password");
      return handleSuccess(updatedUser, "อัพเดท User และรหัสผ่านสำเร็จ");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!user) {
      return handleError(null, "ไม่พบ User ที่ต้องการแก้ไข", 404);
    }

    return handleSuccess(user, "อัพเดท User สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

// delete user
exports.deleteUser = async (userId) => {
  try {
    if (!userId) {
      return handleError(null, "กรุณาระบุ ID ของ User", 400);
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return handleError(null, "ไม่พบ User ที่ต้องการลบ", 404);
    }

    return handleSuccess(null, "ลบ User สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

// active user
exports.activeUser = async (userId) => {
  try {
    if (!userId) {
      return handleError(null, "กรุณาระบุ ID ของ User", 400);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { active: true } },
      { new: true }
    ).select("-password");

    if (!user) {
      return handleError(null, "ไม่พบ User ที่ต้องการเปิดใช้งาน", 404);
    }

    return handleSuccess(user, "อัพเดทสถานะ User เป็น active สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

// disactive user
exports.deactiveUser = async (userId) => {
  try {
    if (!userId) {
      return handleError(null, "กรุณาระบุ ID ของ User", 400);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { active: false } },
      { new: true }
    ).select("-password");

    if (!user) {
      return handleError(null, "ไม่พบ User ที่ต้องการปิดใช้งาน", 404);
    }

    return handleSuccess(user, "อัพเดทสถานะ User เป็น inactive สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

exports.getPasswordHistoryByUserId = async (id) => {
  if (!id) {
    throw { status: 400, message: "กรุณาระบุ id" };
  }

  const history = await PasswordHistory.findOne({ user_id: id })
    .select("-password")
    .lean();

  if (!history) {
    throw { status: 404, message: "ไม่พบประวัติการเปลี่ยนรหัสผ่าน" };
  }

  return history;
};

exports.requestForgotPassword = async (phone) => {
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      throw { status: 404, message: "ไม่พบผู้ใช้งานนี้ในระบบ" };
    }

    const existingRequest = await ForgotPasswordRequest.findOne({
      user_id: user._id,
      status: "pending",
    });

    if (existingRequest) {
      throw {
        status: 400,
        message: "คุณได้แจ้งผู้ดูแลระบบแล้ว กรุณารอการดำเนินการ",
      };
    }

    const request = new ForgotPasswordRequest({
      user_id: user._id,
      phone: user.phone,
      method: "phone",
      status: "pending",
    });

    await request.save();

    return request;
  } catch (error) {
    throw error;
  }
};

exports.checkReferenceCode = async (code) => {
  try {
    const masterRecord = await Master.findOne({ slug: code });
    if (masterRecord) return true;

    const userRecord = await User.findOne({ referral_code: code });
    return !!userRecord;
  } catch (error) {
    console.error("Error in checkReferenceCode:", error);
    throw error;
  }
};

// ค้นหา user สำหรับ select search
exports.searchUsers = async (searchTerm) => {
  try {
    if (!searchTerm) {
      return handleSuccess([], "ดึงข้อมูล User สำเร็จ");
    }

    // ถ้า searchTerm เป็นตัวเลข จะค้นหา credit ด้วย
    const isNumber = !isNaN(searchTerm);
    const searchQuery = {
      $or: [
        { username: { $regex: searchTerm, $options: "i" } },
        { phone: { $regex: searchTerm, $options: "i" } },
        { full_name: { $regex: searchTerm, $options: "i" } }
      ]
    };

    // ถ้าเป็นตัวเลข เพิ่มการค้นหา credit
    if (isNumber) {
      searchQuery.$or.push({ credit: Number(searchTerm) });
    }

    const users = await User.find(searchQuery)
      .select("_id username phone full_name credit")
      .limit(10);

    return handleSuccess(users, "ดึงข้อมูล User สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};


// 
