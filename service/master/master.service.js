const master = require("../../models/master.model");
const { generateMasterId } = require("../../utils/utils");
const user = require("../../models/user.model");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

// เพิ่ม master
exports.createMaster = async (
  username,
  email,
  password,
  phone,
  commission_percentage
) => {
  try {
    const existingMaster = await master.findOne({
      $or: [{ username }, { email }],
    });

    if (existingMaster) {
      return handleError(null, "Username หรือ Email นี้มีอยู่ในระบบแล้ว", 400);
    }

    const newMaster = new master({
      username,
      email,
      password,
      phone,
      commission_percentage,
    });

    const savedMaster = await newMaster.save();

    return handleSuccess(
      {
        id: savedMaster._id,
        username: savedMaster.username,
        email: savedMaster.email,
        slug: savedMaster.slug,
        share_url_master: savedMaster.share_url_master,
      },
      "สร้าง Master สำเร็จ",
      201
    );
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
        email: master.email,
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
exports.getAllMasters = async ({ page = 1, perPage = 10, search }) => {
  try {
    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * perPage;

    const [masters, total] = await Promise.all([
      master
        .find(query)
        .skip(skip)
        .limit(perPage)
        .sort({ createdAt: -1 })
        .select("-password"),
      master.countDocuments(query),
    ]);

    const pagination = {
      currentPage: parseInt(page),
      perPage: parseInt(perPage),
      totalItems: total,
      totalPages: Math.ceil(total / perPage),
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
exports.updateMaster = async (id, data) => {
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

    if (data.email) {
      const existingEmail = await master.findOne({
        email: data.email,
        _id: { $ne: id },
      });

      if (existingEmail) {
        return handleError(null, "Email นี้มีอยู่ในระบบแล้ว", 400);
      }
    }

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
