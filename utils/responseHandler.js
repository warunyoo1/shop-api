const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

async function handleSuccess(
  data,
  message = "Operation successful",
  status = 200,
  pagination = null
) {
  const response = {
    success: true,
    status,
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return response;
}

async function handleError(
  error,
  message = "An error occurred during the operation",
  status = 500
) {
  console.error(error);
  return {
    success: false,
    status,
    message,
    error: error?.message || error,
  };
}

async function handleAuthSuccess(
  token,
  refreshToken,
  user,
  message = "เข้าสู่ระบบสำเร็จ",
  status = 200
) {
  return {
    success: true,
    status,
    user,
    message,
    token,
    refreshToken,
  };
}

async function handleAuthError(
  error,
  message = "An error occurred during the authentication",
  status = 500
) {
  return handleError(error, message, status);
}

async function formatCreateUserResponse(user) {
  const userObj = user.toObject ? user.toObject() : user;

  const response = {
    _id: userObj._id,
    createdAt: userObj.createdAt,
    updatedAt: userObj.updatedAt,
  };

  if (userObj.master_id && userObj.master_id !== "") {
    response.master_id = userObj.master_id;
  }

  return response;
}

async function handleSuccessResetResponse(data, message) {
  console.log("data", data);
  console.log("message", message);
  try {
    const cleanedData = removeNullValues(data) || {};
    console.log(
      "After handleSuccessResetResponse cleaning:",
      JSON.stringify(cleanedData, null, 2)
    );
    return {
      success: true,
      status: 200,
      message,
      data: cleanedData,
    };
  } catch (error) {
    console.error("❌ Error in handleSuccessResetResponse:", error.message);
    return await handleError(error, "Failed to process response data");
  }
}

function removeNullValues(
  obj,
  depth = 0,
  maxDepth = 100,
  seen = new WeakSet()
) {
  if (depth > maxDepth) {
    throw new Error("Maximum recursion depth exceeded");
  }

  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (seen.has(obj)) {
    return undefined;
  }
  seen.add(obj);
  const source =
    obj && typeof obj === "object" && "_doc" in obj ? obj._doc : obj;

  const newObj = Array.isArray(source) ? [] : {};

  const isMongoObjectId = (value) =>
    value &&
    typeof value === "object" &&
    typeof value.toHexString === "function";

  for (const [key, value] of Object.entries(source)) {
    console.log(`Checking key: ${key} with value:`, value);

    if (key.startsWith("$") || key === "__v") {
      console.log(`Skipping key: ${key}`);
      continue;
    }

    if (value === null || value === undefined) {
      console.log(`Skipping null/undefined key: ${key}`);
      continue;
    }

    if (Array.isArray(value) && value.length === 0) {
      console.log(`Skipping empty array key: ${key}`);
      continue;
    }

    if (
      typeof value === "object" &&
      !Buffer.isBuffer(value) &&
      !isMongoObjectId(value) &&
      !(value instanceof Date)
    ) {
      const nested = removeNullValues(value, depth + 1, maxDepth, seen);
      if (
        nested &&
        (Array.isArray(nested)
          ? nested.length > 0
          : Object.keys(nested).length > 0)
      ) {
        newObj[key] = nested;
      }
    } else {
      if (["startDate", "endDate", "createdAt", "updatedAt"].includes(key)) {
        const dateValue = value instanceof Date ? value : new Date(value);
        if (!isNaN(dateValue.getTime())) {
          newObj[key] = dateValue.toISOString();
          console.log(`Keeping date key: ${key} with value: ${newObj[key]}`);
        } else {
          console.log(`Invalid date for key: ${key} with value: ${value}`);
        }
      } else if (isMongoObjectId(value)) {
        newObj[key] = value.toHexString();
        console.log(`Converted ObjectId for key: ${key}`);
      } else {
        newObj[key] = value instanceof Date ? value.toISOString() : value;
        console.log(`Keeping key: ${key} with value: ${newObj[key]}`);
      }
    }
  }

  if (Array.isArray(newObj)) {
    return newObj.filter((item) => item !== undefined && item !== null);
  } else {
    return Object.keys(newObj).length > 0 ? newObj : undefined;
  }
}

module.exports = {
  handleSuccess,
  handleError,
  handleAuthSuccess,
  handleAuthError,
  formatCreateUserResponse,
  handleSuccessResetResponse,
};
