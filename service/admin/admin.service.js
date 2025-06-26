const admin = require("../../models/admin.model");
const superadmin = require("../../models/superadmin.model");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

// create admin
exports.createAdmin = async (
  username,
  email,
  password,
  phone,
  address,
  role
) => {
  try {
    const existingAdmin = await admin.findOne({
      $or: [{ username }, { email }],
    });

    const existingSuperadmin = await superadmin.findOne({
      $or: [{ username }, { email }],
    });

    if (existingAdmin || existingSuperadmin) {
      return handleError(null, "Username หรือ Email นี้มีอยู่ในระบบแล้ว", 400);
    }
    const newAdmin = new admin({
      username,
      email,
      password,
      phone,
      address,
      role,
    });
    const savedAdmin = await newAdmin.save();
    return handleSuccess(savedAdmin, "สร้าง Admin สำเร็จ", 201);
  } catch (error) {
    return handleError(error);
  }
};

// get admin
exports.getadmin = async ({ page = 1, perPage = 10, search }) => {
  try {
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [admins, total] = await Promise.all([
      admin
        .find(query)
        .select("-password")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: -1 }),
      admin.countDocuments(query),
    ]);

    const pagination = {
      currentPage: page,
      perPage: perPage,
      totalItems: total,
      totalPages: Math.ceil(total / perPage),
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
exports.updateadmin = async (id, updateData) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ admin", 400);
    }

    if (updateData.username || updateData.email) {
      const existingAdmin = await admin.findOne({
        $or: [{ username: updateData.username }, { email: updateData.email }],
        _id: { $ne: id },
      });

      const existingSuperadmin = await superadmin.findOne({
        $or: [{ username: updateData.username }, { email: updateData.email }],
      });

      if (existingAdmin || existingSuperadmin) {
        return handleError(
          null,
          "Username หรือ Email นี้มีอยู่ในระบบแล้ว",
          400
        );
      }
    }

    updateData.updatedAt = new Date();

    const result = await admin
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .select("-password");

    if (!result) {
      return handleError(null, "ไม่พบ Admin ที่ต้องการแก้ไข", 404);
    }

    return handleSuccess(result, "อัพเดท Admin สำเร็จ");
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
