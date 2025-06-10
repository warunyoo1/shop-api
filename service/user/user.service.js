const User = require("../../models/user.model");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

exports.registerUser = async ({ username, email, password, phone, master_id = null }) => {
  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return handleError(null, "Email นี้มีอยู่ในระบบแล้ว", 400);
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return handleError(null, "Username นี้มีอยู่ในระบบแล้ว", 400);
    }

    const user = new User({ username, email, password, phone, master_id });
    const savedUser = await user.save();

    return handleSuccess(savedUser, "สมัครสมาชิกสำเร็จ", 201);
  } catch (error) {
    return handleError(error);
  }
};

// get all user
exports.getuser = async ({ page = 1, perPage = 10, search }) => {
  try {
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * perPage;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage),
      User.countDocuments(query)
    ]);

    const pagination = {
      currentPage: parseInt(page),
      perPage: parseInt(perPage),
      totalItems: total,
      totalPages: Math.ceil(total / perPage)
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

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return handleError(null, "ไม่พบ User", 404);
    }

    return handleSuccess(user, "ดึงข้อมูล User สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

// update user
exports.updateUser = async (userId, updateData) => {
  try {
    if (!userId) {
      return handleError(null, "กรุณาระบุ ID ของ User", 400);
    }

    if (updateData.username || updateData.email) {
      const existingUser = await User.findOne({
        $or: [
          { username: updateData.username },
          { email: updateData.email }
        ],
        _id: { $ne: userId }
      });

      if (existingUser) {
        return handleError(null, "Username หรือ Email นี้มีอยู่ในระบบแล้ว", 400);
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

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
    ).select('-password');

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
    ).select('-password');

    if (!user) {
      return handleError(null, "ไม่พบ User ที่ต้องการปิดใช้งาน", 404);
    }

    return handleSuccess(user, "อัพเดทสถานะ User เป็น inactive สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

 