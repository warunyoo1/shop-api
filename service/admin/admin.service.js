const admin = require("../../models/admin.model");
const superadmin = require("../../models/superadmin.model");
const { handleSuccess, handleError } = require("../../utils/responseHandler");
const PasswordHistory = require("../../models/history.chang.password.model");
const bcrypt = require("bcrypt");

// create admin
exports.createAdmin = async (username, password, phone, role) => {
  try {
    const existingAdmin = await admin.findOne({
      username,
    });

    const existingSuperadmin = await superadmin.findOne({
      username,
    });

    if (existingAdmin || existingSuperadmin) {
      return handleError(null, "Username นี้มีอยู่ในระบบแล้ว", 400);
    }

    const newAdmin = new admin({
      username,
      password,
      phone,
      role,
    });
    const savedAdmin = await newAdmin.save();
    return handleSuccess(savedAdmin, "สร้าง Admin สำเร็จ", 201);
  } catch (error) {
    return handleError(error);
  }
};

// get admin
exports.getadmin = async ({ page = 1, perpage = 10, search }) => {
  try {
    const query = {};
    if (search) {
      query.$or = [{ username: { $regex: search, $options: "i" } }];
    }

    const [admins, total] = await Promise.all([
      admin
        .find(query)
        .select("-password")
        .skip((page - 1) * perpage)
        .limit(perpage)
        .sort({ createdAt: -1 }),
      admin.countDocuments(query),
    ]);

    const pagination = {
      currentPage: page,
      perPage: perpage,
      totalItems: total,
      totalPages: Math.ceil(total / perpage),
    };

    return handleSuccess(admins, "ดึงข้อมูล Admin สำเร็จ", 200, pagination);
  } catch (error) {
    return handleError(error);
  }
};

// get admin by id
exports.getadminById = async (id) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ admin", 400);
    }
    const result = await admin.findById(id).select("-password");
    if (!result) {
      return handleError(null, "ไม่พบ Admin", 404);
    }
    return handleSuccess(result, "ดึงข้อมูล Admin สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

// update admin
exports.updateadmin = async (id, updateData, currentUser) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ admin", 400);
    }

    if (updateData.username) {
      const existingAdmin = await admin.findOne({
        username: updateData.username,
        _id: { $ne: id },
      });

      const existingSuperadmin = await superadmin.findOne({
        username: updateData.username,
      });

      if (existingAdmin || existingSuperadmin) {
        return handleError(null, "Username นี้มีอยู่ในระบบแล้ว", 400);
      }
    }

    const now = new Date();

    if (updateData.password) {
      const adminData = await admin.findById(id);
      if (!adminData) {
        return handleError(null, "ไม่พบ Admin ที่ต้องการแก้ไข", 404);
      }

      const oldPassword = adminData.password; // ดึงรหัสผ่านเก่า
      const hashedPassword = await bcrypt.hash(updateData.password, 10);

      // อัปเดต password และ history
      await admin.findByIdAndUpdate(id, {
        $set: {
          ...updateData,
          password: hashedPassword,
        },
        $push: {
          last_password_change: {
            date: now,
            password: oldPassword,
            changed_by: {
              user_id: currentUser.user_id,
              role: currentUser.role,
              full_name: currentUser.full_name,
            },
          },
        },
      });

      // อัปเดต PasswordHistory
      const passwordHistoryLatest = await PasswordHistory.findOne({
        user_id: id,
      }).sort({ changed_at: -1 });

      if (
        passwordHistoryLatest &&
        passwordHistoryLatest.user_id.toString() === id.toString()
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
                password: oldPassword,
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
          user_id: id,
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
              password: oldPassword,
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

      const updatedAdmin = await admin
        .findById(id)
        .select("-password -password_history.password");

      return handleSuccess(updatedAdmin, "อัพเดท Admin และรหัสผ่านสำเร็จ");
    }

    updateData.updatedAt = now;
    const updatedAdmin = await admin
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .select("-password");

    if (!updatedAdmin) {
      return handleError(null, "ไม่พบ Admin ที่ต้องการแก้ไข", 404);
    }

    return handleSuccess(updatedAdmin, "อัพเดท Admin สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

// delete admin
exports.deleteadmin = async (id) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ admin", 400);
    }

    const result = await admin.findByIdAndDelete(id);

    if (!result) {
      return handleError(null, "ไม่พบ Admin ที่ต้องการลบ", 404);
    }

    return handleSuccess(null, "ลบ Admin สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

// active admin
exports.activeadmin = async (id) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ admin", 400);
    }

    const result = await admin
      .findByIdAndUpdate(
        id,
        { $set: { active: true, updatedAt: new Date() } },
        { new: true }
      )
      .select("-password");

    if (!result) {
      return handleError(null, "ไม่พบ Admin ที่ต้องการอัพเดท", 404);
    }

    return handleSuccess(result, "อัพเดทสถานะ Admin เป็น active สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

// disactive admin
exports.disactiveadmin = async (id) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ admin", 400);
    }

    const result = await admin
      .findByIdAndUpdate(
        id,
        { $set: { active: false, updatedAt: new Date() } },
        { new: true }
      )
      .select("-password");

    if (!result) {
      return handleError(null, "ไม่พบ Admin ที่ต้องการอัพเดท", 404);
    }

    return handleSuccess(result, "อัพเดทสถานะ Admin เป็น inactive สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};
