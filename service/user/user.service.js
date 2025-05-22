const User = require("../../models/user.model");

exports.registerUser = async ({ username, email, password, phone }) => {
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return { error: "Email already exists" };
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    return { error: "Username already exists" };
  }

  const user = new User({ username, email, password, phone });
  await user.save();

  return { user };
};

// get all user
exports.getuser = async ({ page = 1, perPage = 10, search }) => {
    try {
        // สร้าง query สำหรับค้นหา
        const query = {};
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // คำนวณ skip สำหรับ pagination
        const skip = (page - 1) * perPage;

        // ดึงข้อมูลผู้ใช้ทั้งหมดตามเงื่อนไข
        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(perPage),
            User.countDocuments(query)
        ]);

        return {
            data: users,
            pagination: {
                currentPage: page,
                perPage: perPage,
                totalItems: total,
                totalPages: Math.ceil(total / perPage)
            }
        };
    } catch (error) {
        return { error: error.message };
    }
};

// get user by id
exports.getUserById = async (userId) => {
    try {
        const user = await User.findById(userId).select('-password');
        if (!user) {
           return {error: "User not found"};
        }
        return user;
    } catch (error) {
        return {error: "Error fetching user data"};
    }
};

// update user
exports.updateUser = async (userId, updateData) => {
    try {

      if (!userId) {
        return {error: "User ID is required"};
      }
      // ถ้ามีการอัพเดท username หรือ email ให้เช็คความซ้ำซ้อน
      if (updateData.username || updateData.email) {
        const existingUser = await User.findOne({
            $or: [
                { username: updateData.username },
                { email: updateData.email }
            ],
            _id: { $ne: userId }
        });

        if (existingUser) {
            return {error: "Username or email already exists"};
        }
      }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!user) {
            return {error: "User not found"};
        }
        return user;
    } catch (error) {
        return {error: "Error updating user data"};
    }
};
 
// delete user
exports.deleteUser = async (userId) => {
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return {error: "User not found"};
        }
        return { message: 'User deleted successfully' };
    } catch (error) {
        return {error: "Error deleting user data"};
    }
};

// active user
exports.activeUser = async (userId) => {
    try {
        if (!userId) {
            return { error: "User ID is required" };
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { active: true } },
            { new: true }
        ).select('-password');

        if (!user) {
            return { error: "User not found" };
        }

        return { 
            data: user,
            message: "User activated successfully" 
        };
    } catch (error) {
        return { error: "Error activating user" };
    }
};

// disactive user
exports.deactiveUser = async (userId) => {
    try {
        if (!userId) {
            return { error: "User ID is required" };
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { active: false } },
            { new: true }
        ).select('-password');

        if (!user) {
            return { error: "User not found" };
        }

        return { 
            data: user,
            message: "User deactivated successfully" 
        };
    } catch (error) {
        return { error: "Error deactivating user" };
    }
};

