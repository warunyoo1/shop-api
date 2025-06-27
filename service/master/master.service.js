const master = require("../../models/master.model");
const { generateMasterId } = require("../../utils/utils");
const user = require("../../models/user.model");
const { handleSuccess, handleError } = require("../../utils/responseHandler");
const bcrypt = require("bcrypt");

// เพิ่ม master
exports.createMaster = async (data) => {
  try {
    const existingMaster = await master.findOne({
      username: data.username
    });

    if (existingMaster) {
      return handleError(null, "Username นี้มีอยู่ในระบบแล้ว", 400);
    }

    const newMaster = new master({
      username: data.username,
      password: data.password,
      phone: data.phone,
      commission_percentage: data.commission_percentage
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

    const existingMaster = await master.findById(id);
    if (!existingMaster) {
      return handleError(null, "ไม่พบ Master ที่ต้องการแก้ไข", 404);
    }

    if (data.username) {
      const existingUsername = await master.findOne({
        username: data.username,
        _id: { $ne: id },
      });

      if (existingUsername) {
        return handleError(null, "Username นี้มีอยู่ในระบบแล้ว", 400);
      }
    }

    // ถ้ามีการเปลี่ยนรหัสผ่าน
    if (data.password) {
      // เข้ารหัสรหัสผ่านใหม่
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      // เพิ่มประวัติการเปลี่ยนรหัสผ่าน
      const passwordHistory = {
        password: hashedPassword,
        changed_by: {
          user_id: currentUser.user_id,
          role: currentUser.role,
          full_name: currentUser.full_name
        }
      };

      const now = new Date();

      // อัพเดทข้อมูล
      const updatedMaster = await master.findByIdAndUpdate(
        id,
        { 
          $set: { 
            ...data,
            last_password_change: {
              date: now,
              changed_by: {
                user_id: currentUser.user_id,
                role: currentUser.role,
                full_name: currentUser.full_name
              }
            }
          },
          $push: { password_history: { ...passwordHistory, changed_at: now } }
        },
        { new: true }
      ).select("-password -password_history.password");

      return handleSuccess(updatedMaster, "อัพเดท Master และรหัสผ่านสำเร็จ");
    }

    // กรณีไม่มีการเปลี่ยนรหัสผ่าน
    data.updatedAt = new Date();
    const result = await master
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .select("-password");

    if (!result) {
      return handleError(null, "ไม่พบ Master ที่ต้องการแก้ไข", 404);
    }

    return handleSuccess(result, "อัพเดท Master สำเร็จ");
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
