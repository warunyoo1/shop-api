const mongoose = require("mongoose");
const Promotion = require("../../models/promotion.model");
const User = require("../../models/user.model");
const UserPromotion = require("../../models/userPromotions.models");
const Image = require("../../models/img.promotion.model");
const fs = require("fs");
const path = require("path");

exports.createPromotion = async function (promotionData) {
  try {
    const normalizedType = (promotionData.type || "").trim().toLowerCase();
    const normalizedTarget = (promotionData.target || "").trim().toLowerCase();

    // เช็คซ้ำ: ต้องไม่มี promotion ที่ type และ target ซ้ำกัน (case-insensitive)
    const exists = await Promotion.findOne({
      type: { $regex: new RegExp(`^${normalizedType}$`, "i") },
      target: { $regex: new RegExp(`^${normalizedTarget}$`, "i") },
    });
    if (exists) {
      throw new Error("ประเภทโปรโมชั่นและกลุ่มเป้าหมายนี้ถูกใช้ไปแล้ว");
    }
    promotionData.type = normalizedType;
    promotionData.target = normalizedTarget;

    // 🔍 ตรวจสอบเฉพาะตอน target = 'specific'
    if (promotionData.target === "specific") {
      await validateSpecificUsers(promotionData.specificUsers || []);
    }

    const savedPromotion = await createNewPromotion(promotionData);

    const userFilter = getUserFilterByTarget(
      promotionData.target,
      promotionData.specificUsers || []
    );

    await createUserPromotionsForUsers(savedPromotion._id, userFilter);

    return savedPromotion;
  } catch (error) {
    console.error("❌ Failed to create promotion:", error.message);
    throw error;
  }
};

exports.createPromotionByUserID = async function (promotionData) {
  try {
    const { allowed_user_ids = [] } = promotionData;

    const validUsers = await User.find({
      _id: { $in: allowed_user_ids },
    });

    const validUserIds = validUsers.map((user) => user._id.toString());

    const invalidUserIds = allowed_user_ids.filter(
      (id) => !validUserIds.includes(id.toString())
    );

    if (invalidUserIds.length > 0) {
      const error = new Error(`Invalid user IDs: ${invalidUserIds.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }

    const promotion = new Promotion(promotionData);
    return await promotion.save();
  } catch (error) {
    console.error("❌ Error in createPromotionByUserID:", error.message);
    throw error;
  }
};

exports.getActivePromotions = async function () {
  const now = new Date();
  return await Promotion.find({
    active: true,
    $or: [{ start_date: { $lte: now } }, { start_date: null }],
    $or: [{ end_date: { $gte: now } }, { end_date: null }],
  });
};

exports.getPromotionById = async function (promotionId) {
  return await Promotion.findById(promotionId).populate("images");
};

exports.getAllPromotions = async function ({ page = 1, limit = 10 }) {
  try {
    const skip = (page - 1) * limit;
    const total = await Promotion.countDocuments();
    const promotions = await Promotion.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("images");

    return {
      data: promotions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Failed to get promotions: ${error.message}`);
  }
};

exports.uploadService = async (file, promotionId, description, req) => {
  try {
    const promotionExists = await Promotion.findById(promotionId);
    if (!promotionExists) {
      throw new Error("Promotion ID not found");
    }
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const existingImage = await Image.findOne({ promotion_id: promotionId });

    if (existingImage) {
      const oldImagePath = path.join(
        uploadDir,
        path.basename(existingImage.image)
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const filename = `${Date.now()}_${file.name}`;
    const filepath = path.join(uploadDir, filename);
    await file.mv(filepath);

    const url = `${req.protocol}://${req.get("host")}/uploads/${filename}`;

    if (existingImage) {
      existingImage.name = file.name;
      existingImage.description = description;
      existingImage.image = url;
      await existingImage.save();

      return {
        name: file.name,
        url,
        mongoId: existingImage._id,
      };
    } else {
      const image = new Image({
        promotion_id: promotionId,
        name: file.name,
        description,
        image: url,
      });

      await image.save();

      return {
        name: file.name,
        url,
        mongoId: image._id,
      };
    }
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};

exports.getImagesByPromotionId = async (promotion_id) => {
  return await Image.find({ promotion_id })
    .select("name description img createdAt -_id")
    .lean();
};

async function createNewPromotion(promotionData) {
  const promotion = new Promotion(promotionData);
  return await promotion.save();
}

async function createUserPromotionsForUsers(promotionId, userFilter) {
  try {
    const targetUsers = await User.find(userFilter);
    if (targetUsers.length === 0) {
      console.log("ℹ️ No users matched target criteria.");
      return;
    }

    for (const user of targetUsers) {
      if (!user._id) continue;

      try {
        const existingUserPromotion = await UserPromotion.findOne({
          user_id: user._id,
        });

        const newPromotion = {
          promotion_id: promotionId,
          status: "pending",
          progress: {
            depositCount: 0,
            depositTotal: 0,
            betTotal: 0,
            lossTotal: 0,
            lastDepositDate: null,
            consecutiveDays: 0,
          },
          reward: {
            type: "",
            amount: 0,
            basedOn: "",
            withdrawable: false,
            description: "",
            givenAt: null,
          },
          note: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (existingUserPromotion) {
          const alreadyHasPromotion = existingUserPromotion.promotions.some(
            (promo) => promo.promotion_id.toString() === promotionId.toString()
          );
          if (!alreadyHasPromotion) {
            existingUserPromotion.promotions.push(newPromotion);
            existingUserPromotion.updatedAt = new Date();
            await existingUserPromotion.save();
            console.log(
              `✅ Added promotion to existing UserPromotion for user ${user._id}`
            );
          } else {
            console.log(`ℹ️ User ${user._id} already has this promotion`);
          }
        } else {
          const newUserPromotion = new UserPromotion({
            user_id: user._id,
            balance: 0,
            promotions: [newPromotion],
          });
          await newUserPromotion.save();
          console.log(`✅ Created new UserPromotion for user ${user._id}`);
        }
      } catch (innerError) {
        console.error(`❌ Error processing user ${user._id}:`, innerError);
      }
    }
  } catch (error) {
    console.error("❌ Error creating user promotions:", error);
    throw error;
  }
}

function getUserFilterByTarget(target, specificUsers = []) {
  if (specificUsers && specificUsers.length > 0 && target !== "specific") {
    throw new Error("specificUsers can only be used when target is 'specific'");
  }
  switch (target) {
    case "master":
      return { master_id: { $ne: null } };
    case "referrer":
      return { referral_by: { $ne: null } };
    case "normal":
      return { referral_by: null, master_id: null };
    case "specific":
      if (!Array.isArray(specificUsers) || specificUsers.length === 0) {
        throw new Error(
          "specificUsers ต้องเป็น array ที่ไม่ว่างเมื่อ target เป็น 'specific'"
        );
      }
      return {
        _id: {
          $in: specificUsers.map((id) => new mongoose.Types.ObjectId(id)),
        }, // ✅ ถูก
      };

    case "all":
      return {};
    default:
      throw new Error(`Invalid target type: ${target}`);
  }
}

async function validateSpecificUsers(specificUsers) {
  try {
    const objectIds = specificUsers.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    const foundUsers = await User.find({ _id: { $in: objectIds } }).select(
      "_id"
    );
    const foundIds = foundUsers.map((user) => user._id.toString());

    const notFoundIds = specificUsers.filter(
      (id) => !foundIds.includes(id.toString())
    );

    if (notFoundIds.length > 0) {
      throw new Error(`User(s) not found for ID(s): ${notFoundIds.join(", ")}`);
    }

    return objectIds;
  } catch (err) {
    console.error("❌ Error in validateSpecificUsers:", err.message);
    throw err;
  }
}

exports.getAllUserPromotions = async function ({ page = 1, limit = 10 }) {
  try {
    const skip = (page - 1) * limit;
    const total = await Promotion.countDocuments();
    const UserPromotions = await UserPromotion.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return {
      data: UserPromotions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Failed to get UserPromotion: ${error.message}`);
  }
};

exports.getUserPromotionsById = async function (userId) {
  try {
    const userPromotions = await UserPromotion.find({ _id: userId }).sort({
      createdAt: -1,
    });
    return userPromotions;
  } catch (error) {
    throw new Error(`Failed to get UserPromotion by userId: ${error.message}`);
  }
};

exports.deletePromotionById = async (promotionId) => {
  try {
    const deletedPromotion = await Promotion.findByIdAndDelete(promotionId);
    await UserPromotion.updateMany(
      {},
      { $pull: { promotions: { promotion_id: promotionId } } }
    );

    return deletedPromotion;
  } catch (error) {
    throw new Error("Error deleting promotion: " + error.message);
  }
};
