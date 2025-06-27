const superadmin = require("../../models/superadmin.model");
const admin = require("../../models/admin.model");
const { handleSuccess, handleError } = require("../../utils/responseHandler");
const PasswordHistory = require("../../models/history.chang.password.model");
const bcrypt = require("bcrypt");

exports.createSuperadmin = async ({ username, password, phone }) => {
  try {
    const existingSuperadmin = await superadmin.findOne({
      username,
    });

    const existingAdmin = await admin.findOne({
      username,
    });

    if (existingSuperadmin || existingAdmin) {
      return handleError(null, "Username นี้มีอยู่ในระบบแล้ว", 400);
    }

    const newSuperadmin = new superadmin({
      username,
      password,
      phone,
    });

    const savedSuperadmin = await newSuperadmin.save();
    return handleSuccess(savedSuperadmin, "สร้าง Superadmin สำเร็จ", 201);
  } catch (error) {
    return handleError(error);
  }
};

exports.getSuperadmin = async ({ page = 1, perpage = 10, search }) => {
  try {
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * perpage;

    const [superadmins, total] = await Promise.all([
      superadmin
        .find(query)
        .select("-password")
        .skip(skip)
        .limit(perpage)
        .sort({ createdAt: -1 }),
      superadmin.countDocuments(query),
    ]);

    const pagination = {
      currentPage: page,
      perPage: perpage,
      totalItems: total,
      totalPages: Math.ceil(total / perpage),
    };

    return handleSuccess(
      superadmins,
      "ดึงข้อมูล Superadmin สำเร็จ",
      200,
      pagination
    );
  } catch (error) {
    return handleError(error);
  }
};

exports.getSuperadminById = async (id) => {
  try {
    const result = await superadmin.findById(id).select("-password");
    if (!result) {
      return handleError(null, "ไม่พบ Superadmin", 404);
    }
    return handleSuccess(result, "ดึงข้อมูล Superadmin สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

exports.updateSuperadmin = async (id, updateData, currentUser) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ Superadmin", 400);
    }

    if (updateData.username) {
      const existingSuperadmin = await superadmin.findOne({
        username: updateData.username,
        _id: { $ne: id },
      });

      const existingAdmin = await admin.findOne({
        username: updateData.username,
      });

      if (existingSuperadmin || existingAdmin) {
        return handleError(null, "Username นี้มีอยู่ในระบบแล้ว", 400);
      }
    }

    const now = new Date();

    if (updateData.password) {
      const existingSuperadmin = await superadmin.findById(id);
      if (!existingSuperadmin) {
        return handleError(null, "ไม่พบ Superadmin ที่ต้องการแก้ไข", 404);
      }

      const oldPassword = existingSuperadmin.password;
      const hashedPassword = await bcrypt.hash(updateData.password, 10);

      await superadmin.findByIdAndUpdate(id, {
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

      const updatedSuperadmin = await superadmin
        .findById(id)
        .select("-password -password_history.password");

      return handleSuccess(
        updatedSuperadmin,
        "อัพเดท Superadmin และรหัสผ่านสำเร็จ"
      );
    }

    updateData.updatedAt = now;

    const updated = await superadmin
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .select("-password");

    if (!updated) {
      return handleError(null, "ไม่พบ Superadmin ที่ต้องการอัพเดท", 404);
    }

    return handleSuccess(updated, "อัพเดท Superadmin สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

exports.deleteSuperadmin = async (id) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ superadmin", 400);
    }

    const result = await superadmin.findByIdAndDelete(id);

    if (!result) {
      return handleError(null, "ไม่พบ superadmin ที่ต้องการลบ", 404);
    }

    return handleSuccess(null, "ลบ superadmin สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

exports.activesuperadmin = async (id) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ superadmin", 400);
    }

    const result = await superadmin
      .findByIdAndUpdate(
        id,
        { $set: { active: true, updatedAt: new Date() } },
        { new: true }
      )
      .select("-password");

    if (!result) {
      return handleError(null, "ไม่พบ superadmin ที่ต้องการอัพเดท", 404);
    }

    return handleSuccess(result, "อัพเดทสถานะ superadmin เป็น active สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

exports.disactivesuperadmin = async (id) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ superadmin", 400);
    }

    const result = await superadmin
      .findByIdAndUpdate(
        id,
        { $set: { active: false, updatedAt: new Date() } },
        { new: true }
      )
      .select("-password");

    if (!result) {
      return handleError(null, "ไม่พบ superadmin ที่ต้องการอัพเดท", 404);
    }

    return handleSuccess(result, "อัพเดทสถานะ superadmin เป็น inactive สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};
