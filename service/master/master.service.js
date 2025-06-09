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
      return await handleError("Username or Email already exists", "Duplicate entry", 400);
    }
    const newMaster = new master({
      username,
      email,
      password,
      phone,
      commission_percentage,
    });

    await newMaster.save();

    const baseUrl = process.env.APP_BASE_URL;
    newMaster.profileUrl = `${baseUrl}/master/${newMaster.username}`;

    await newMaster.save();

    return { data: newMaster };
  } catch (error) {
    console.error("Error creating master:", error);
    return { error: "Error creating master " };
  }
};

// ดึงข้อมูล master
exports.getAllMasters = async ({ page = 1, perPage = 10, search }) => {
  const query = {};

  // ถ้ามีการค้นหา ให้ค้นหาจาก username หรือ email
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // คำนวณจำนวนรายการที่จะข้าม (skip) สำหรับ pagination
  const skip = (page - 1) * perPage;

  // ดึงข้อมูลพร้อมกับ pagination
  const masters = await master
    .find(query)
    .skip(skip)
    .limit(perPage)
    .sort({ createdAt: -1 })
    .select("-password");

  // นับจำนวนรายการทั้งหมดที่ตรงกับเงื่อนไขการค้นหา
  const total = await master.countDocuments(query);

  return {
    data: masters,
    pagination: {
      total,
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalPages: Math.ceil(total / perPage),
    },
  };
};

// ดึงข้อมูล master ตาม id
exports.getMasterById = async (id) => {
  if (!id) {
    return { error: "Id is required" };
  }
  const result = await master.findById(id).select("-password");
  if (!result) {
    return { error: "Master by id not found" };
  }
  return { data: result };
};

// อัพเดตข้อมูล master
exports.updateMaster = async (id, data) => {
  if (!id) {
    return { error: "Id is required" };
  }

  // เช็ค id ว่ามีไหม
  const existingMaster = await master.findById(id);
  if (!existingMaster) {
    return { error: "ไม่พบ master ที่ต้องการแก้ไข" };
  }

  // เช็ค username ซ้ำ
  if (data.username) {
    const existingUsername = await master.findOne({
      username: data.username,
      _id: { $ne: id },
    });

    if (existingUsername) {
      return { error: "Username นี้มีอยู่ในระบบแล้ว" };
    }
  }

  // เช็ค email ซ้ำ
  if (data.email) {
    const existingEmail = await master.findOne({
      email: data.email,
      _id: { $ne: id },
    });

    if (existingEmail) {
      return { error: "Email นี้มีอยู่ในระบบแล้ว" };
    }
  }

  const result = await master
    .findByIdAndUpdate(id, { $set: data }, { new: true })
    .select("-password");

  if (!result) {
    return { error: "ไม่พบ master ที่ต้องการแก้ไข" };
  }

  return { data: result };
};

// ลบข้อมูล master
exports.deleteMaster = async (id) => {
  if (!id) {
    return { error: "Id is required" };
  }

  const result = await master.findByIdAndDelete(id);
  if (!result) {
    return { error: "ไม่พบ master ที่ต้องการลบ" };
  }
  return { data: result };
};

// active master
exports.activateMaster = async (id) => {
  if (!id) {
    return { error: "Id is required" };
  }

  const result = await master.findByIdAndUpdate(
    id,
    { active: true },
    { new: true }
  );
  if (!result) {
    return { error: "ไม่พบ master ที่ต้องการเปิดใช้งาน" };
  }
  return { data: result };
};

// disactive master
exports.deactivateMaster = async (id) => {
  if (!id) {
    return { error: "Id is required" };
  }

  const result = await master.findByIdAndUpdate(
    id,
    { active: false },
    { new: true }
  );
  if (!result) {
    return { error: "ไม่พบ master ที่ต้องการปิดใช้งาน" };
  }
  return { data: result };
};


// ดึงข้อมูล customer ที่สมัครผ่าน master
exports.getCustomerByMaster = async (masterId) => {
  if (!masterId) {
    return { error: "Id is required" };
  }
  const result = await user.find({ master_id:masterId });
  return { data: result };
};
