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
  return {
    _id: userObj._id,
    full_name: userObj.full_name,
    username: userObj.username,
    master_id: userObj.master_id,
    referral_code: userObj.referral_code,
    createdAt: userObj.createdAt,
    updatedAt: userObj.updatedAt,
  };
}

module.exports = {
  handleSuccess,
  handleError,
  handleAuthSuccess,
  handleAuthError,
  formatCreateUserResponse
};
