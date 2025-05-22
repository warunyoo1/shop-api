const superadmin = require("../../models/superadmin.model");
const admin = require("../../models/admin.model");
exports.createSuperadmin = async ({ username, email, password, phone, address}) => {
    //เช็คว่ามี username และ อีเมล์ซ้ำไหม
    const existingSuperadmin = await superadmin.findOne({
        $or: [{ username }, { email }]
    });

    const existingAdmin = await admin.findOne({
        $or: [{ username }, { email }]
    });

    if (existingSuperadmin || existingAdmin) {
        return { error: "Username หรือ Email นี้มีอยู่ในระบบแล้ว" };
    }

    const newSuperadmin = new superadmin({
        username,
        email,
        password,
        phone,
        address
    });

    return await newSuperadmin.save();
};

exports.getSuperadmin = async ({ page = 1, perPage = 10, search }) => {
    const query = {};
    
    // สร้างเงื่อนไขการค้นหา
    if (search) {
        query.$or = [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
        ];
    }

    // คำนวณ skip สำหรับ pagination
    const skip = (page - 1) * perPage;

    // ดึงข้อมูลพร้อม pagination
    const [superadmins, total] = await Promise.all([
        superadmin.find(query)
            .select('-password')
            .skip(skip)
            .limit(perPage)
            .sort({ createdAt: -1 }),
        superadmin.countDocuments(query)
    ]);
 
    return {
        data: superadmins,
        pagination: {
            currentPage: page,
            perPage: perPage,
            totalItems: total,
            totalPages: Math.ceil(total / perPage)
        }
    };
};

exports.getSuperadminById = async (id) => {
    const result = await superadmin.findById(id).select('-password');
    if(!result){
        return {error: "Superadmin by id  not found"};
    }
    return {data: result};
};

exports.updateSuperadmin = async (id, updateData) => {
    if (!id) {
        return { error: "กรุณาระบุ ID ของ superadmin" };
    }

    // ถ้ามีการอัพเดท username หรือ email ให้เช็คความซ้ำซ้อน
    if (updateData.username || updateData.email) {
        const existingSuperadmin = await superadmin.findOne({
            $or: [
                { username: updateData.username },
                { email: updateData.email }
            ]
        });

        const existingAdmin = await admin.findOne({
            $or: [
                { username: updateData.username },
                { email: updateData.email }
            ]
        });

        if (existingSuperadmin || existingAdmin) {
            return { error: "Username หรือ Email นี้มีอยู่ในระบบแล้ว" };
        }
    }

    // อัพเดทเวลาที่แก้ไข
    updateData.updatedAt = new Date();

    return await superadmin.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    ).select('-password');

};

exports.deleteSuperadmin = async (id) => {
    if (!id) {
        return { error: "กรุณาระบุ ID ของ superadmin" };
    }

    const result = await superadmin.findByIdAndDelete(id);
    
    if (!result) {
        return { error: "ไม่พบ superadmin ที่ต้องการลบ" };
    }

    return { message: "ลบ superadmin สำเร็จ" };
};



// active superadmin
exports.activesuperadmin = async (id) => {
    if (!id) {
        return { error: "กรุณาระบุ ID ของ superadmin" };
    }

    const result = await superadmin.findByIdAndUpdate(
        id,
        { $set: { active: true, updatedAt: new Date() } },
        { new: true }
    ).select('-password');

    if (!result) {
        return { error: "ไม่พบ superadmin ที่ต้องการอัพเดท" };
    }

    return { data: result };
};

// disactive superadmin
exports.disactivesuperadmin = async (id) => {
    if (!id) {
        return { error: "กรุณาระบุ ID ของ superadmin" };
    }

    const result = await superadmin.findByIdAndUpdate(
        id,
        { $set: { active: false, updatedAt: new Date() } },
        { new: true }
    ).select('-password');

    if (!result) {
        return { error: "ไม่พบ superadmin ที่ต้องการอัพเดท" };
    }

    return { data: result };
};