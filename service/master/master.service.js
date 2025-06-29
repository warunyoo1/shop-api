const master = require("../../models/master.model");
const { generateMasterId } = require("../../utils/utils");
const user = require("../../models/user.model");
const PasswordHistory = require("../../models/history.chang.password.model");
const { handleSuccess, handleError } = require("../../utils/responseHandler");
const bcrypt = require("bcrypt");

// เพิ่ม master
exports.createMaster = async (data) => {
  console.log(data);
  try {
    const existingMaster = await master.findOne({
      username: data.username,
    });

    if (existingMaster) {
      return handleError(null, "Username นี้มีอยู่ในระบบแล้ว", 400);
    }

    const newMaster = new master({
      username: data.username,
      password: data.password,
      phone: data.phone,
      commission_percentage: data.commission_percentage,
    });

    const savedMaster = await newMaster.save();

    const response = {
      id: savedMaster._id,
      username: savedMaster.username,
      phone: savedMaster.phone,
      commission_percentage: savedMaster.commission_percentage,
      active: savedMaster.active,
      createdAt: savedMaster.createdAt,
      updatedAt: savedMaster.updatedAt,
    };

    return handleSuccess(response, "สร้าง Master สำเร็จ", 201);
  } catch (error) {
    return handleError(error);
  }
};

exports.redirectById = async (id) => {
  try {
    const master = await master.findById(id);
    if (!master) {
      return handleError(null, "Master not found", 404);
    }
    return handleSuccess({ slug: master.slug }, "Redirect success", 200);
  } catch (error) {
    return handleError(error);
  }
};

exports.getBySlug = async (slug) => {
  try {
    const master = await master.findOne({ slug });
    if (!master) {
      return handleError(null, "Master not found", 404);
    }
    return handleSuccess(
      {
        id: master._id,
        username: master.username,
        slug: master.slug,
        profileUrl: master.profileUrl,
      },
      "Fetch Master success",
      200
    );
  } catch (error) {
    return handleError(error);
  }
};

// ดึงข้อมูล master
exports.getAllMasters = async ({ page = 1, perpage = 10, search }) => {
  try {
    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * perpage;

    const [masters, total] = await Promise.all([
      master
        .find(query)
        .skip(skip)
        .limit(perpage)
        .sort({ createdAt: -1 })
        .select("-password"),
      master.countDocuments(query),
    ]);

    const pagination = {
      currentPage: parseInt(page),
      perPage: parseInt(perpage),
      totalItems: total,
      totalPages: Math.ceil(total / perpage),
    };

    return handleSuccess(masters, "ดึงข้อมูล Master สำเร็จ", 200, pagination);
  } catch (error) {
    return handleError(error);
  }
};

// ดึงข้อมูล master ตาม id
exports.getMasterById = async (id) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ Master", 400);
    }
    const result = await master.findById(id).select("-password");
    if (!result) {
      return handleError(null, "ไม่พบ Master", 404);
    }
    return handleSuccess(result, "ดึงข้อมูล Master สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

// อัพเดตข้อมูล master
exports.updateMaster = async (id, data, currentUser) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ Master", 400);
    }

    // เช็ค username ซ้ำ
    if (data.username) {
      const existingUsername = await master.findOne({
        username: data.username,
        _id: { $ne: id },
      });

      if (existingUsername) {
        return handleError(null, "Username นี้มีอยู่ในระบบแล้ว", 400);
      }
    }

    const now = new Date();

    if (data.password) {
      const existingMaster = await master.findById(id);
      if (!existingMaster) {
        return handleError(null, "ไม่พบ Master ที่ต้องการแก้ไข", 404);
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      // อัพเดทรหัสผ่านและ last_password_change ใน master
      await master.findByIdAndUpdate(id, {
        $set: {
          ...data,
          password: hashedPassword,
          last_password_change: [
            {
              date: now,
              password: existingMaster.password, // รหัสผ่านเก่า
              changed_by: {
                user_id: currentUser.user_id,
                role: currentUser.role,
                full_name: currentUser.full_name,
              },
            },
          ],
        },
      });

      // หา password history ล่าสุดของ master นี้
      const passwordHistoryLatest = await PasswordHistory.findOne({
        user_id: id,
      }).sort({ changed_at: -1 });

      if (
        passwordHistoryLatest &&
        passwordHistoryLatest.user_id.toString() === id.toString()
      ) {
        // อัพเดท array changed_by และ last_password_change
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
                password: existingMaster.password,
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
        // สร้าง PasswordHistory ใหม่
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
              password: existingMaster.password,
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

      // ดึงข้อมูล master ที่อัพเดทแล้ว (ไม่แสดงรหัสผ่าน)
      const updatedMaster = await master.findById(id).select("-password");
      return handleSuccess(updatedMaster, "อัพเดท Master และรหัสผ่านสำเร็จ");
    }

    // กรณีไม่เปลี่ยนรหัสผ่าน
    const updatedMaster = await master
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .select("-password");

    if (!updatedMaster) {
      return handleError(null, "ไม่พบ Master ที่ต้องการแก้ไข", 404);
    }

    return handleSuccess(updatedMaster, "อัพเดท Master สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

// ลบข้อมูล master
exports.deleteMaster = async (id) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ Master", 400);
    }

    const result = await master.findByIdAndDelete(id);
    if (!result) {
      return handleError(null, "ไม่พบ Master ที่ต้องการลบ", 404);
    }
    return handleSuccess(null, "ลบ Master สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

// active master
exports.activateMaster = async (id) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ Master", 400);
    }

    const result = await master.findByIdAndUpdate(
      id,
      { active: true },
      { new: true }
    );
    if (!result) {
      return handleError(null, "ไม่พบ Master ที่ต้องการเปิดใช้งาน", 404);
    }
    return handleSuccess(result, "อัพเดทสถานะ Master เป็น active สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

// disactive master
exports.deactivateMaster = async (id) => {
  try {
    if (!id) {
      return handleError(null, "กรุณาระบุ ID ของ Master", 400);
    }

    const result = await master.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );
    if (!result) {
      return handleError(null, "ไม่พบ Master ที่ต้องการปิดใช้งาน", 404);
    }
    return handleSuccess(result, "อัพเดทสถานะ Master เป็น inactive สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};

// ดึงข้อมูล customer ที่สมัครผ่าน master
exports.getCustomerByMaster = async (masterId) => {
  try {
    if (!masterId) {
      return handleError(null, "กรุณาระบุ ID ของ Master", 400);
    }

    const result = await user.find({ master_id: masterId });

    if (!result || result.length === 0) {
      return handleError(null, "ไม่พบข้อมูลผู้ใช้", 404);
    }

    return handleSuccess(result, "ดึงข้อมูล Customer สำเร็จ");
  } catch (error) {
    return handleError(error);
  }
};
