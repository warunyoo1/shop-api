const admin = require("../../models/admin.model");
const superadmin = require("../../models/superadmin.model");

// create admin
exports.createAdmin = async (username, email, password, phone, address,role) => {
    //เช็คว่ามี username และ อีเมล์ซ้ำไหม
    const existingAdmin = await admin.findOne({
        $or: [{ username }, { email }]
    });

    const existingSuperadmin = await superadmin.findOne({
        $or: [{ username }, { email }]
    });

    if(existingAdmin || existingSuperadmin){
        return {error: "Username หรือ Email นี้มีอยู่ในระบบแล้ว"};
    }
    const newAdmin = new admin({username, email, password, phone, address,role});
    await newAdmin.save();
    return {data: newAdmin};
};

// get admin
exports.getadmin = async ({ page = 1, perPage = 10, search }) => {
    const query = {};
    if(search){
        query.$or = [
            {username: {$regex: search, $options: "i"}},
            {email: {$regex: search, $options: "i"}}
        ];
    }
    

    const [admins, total] = await Promise.all([
        admin.find(query)
         .select('-password')
        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({createdAt: -1}),
        admin.countDocuments(query)
    ]);

    return {
        data: admins,
        pagination: {
            currentPage: page,
            perPage: perPage,
            totalItems: total,
            totalPages: Math.ceil(total / perPage)
        }
    };
};


// get admin by id
exports.getadminById = async (id) => {
    if(!id){
        return {error: "Id is required"};
    }
    const result = await admin.findById(id).select('-password');
    if(!result){
        return {error: "Admin by id not found"};
    }
    return {data: result};
};


// update admin
exports.updateadmin = async (id, updateData) => {
    if (!id) {
        return { error: "กรุณาระบุ ID ของ admin" };
    }

    // ถ้ามีการอัพเดท username หรือ email ให้เช็คความซ้ำซ้อน
    if (updateData.username || updateData.email) {
        const existingAdmin = await admin.findOne({
            $or: [
                { username: updateData.username },
                { email: updateData.email }
            ],
            _id: { $ne: id }
        });

        const existingSuperadmin = await superadmin.findOne({
            $or: [
                { username: updateData.username },
                { email: updateData.email }
            ]
        });

        if (existingAdmin || existingSuperadmin) {
            return { error: "Username หรือ Email นี้มีอยู่ในระบบแล้ว" };
        }
    }

    // อัพเดทเวลาที่แก้ไข
    updateData.updatedAt = new Date();

    const result = await admin.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    ).select('-password'); 

    if (!result) {
        return { error: "ไม่พบ admin ที่ต้องการแก้ไข" };
    }

    return { data: result };
};


// delete admin
exports.deleteadmin = async (id) => {
    if (!id) {
        return { error: "กรุณาระบุ ID ของ admin" };
    }

    const result = await admin.findByIdAndDelete(id);
    
    if (!result) {
        return { error: "ไม่พบ admin ที่ต้องการลบ" };
    }

    return { message: "ลบ admin สำเร็จ" };
};


