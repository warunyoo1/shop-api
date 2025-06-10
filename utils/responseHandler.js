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
    refreshToken
  };
}

async function handleAuthError(
  error,
  message = "An error occurred during the authentication",
  status = 500
) {
  return handleError(error, message, status);
}

module.exports = { handleSuccess, handleError, handleAuthSuccess, handleAuthError };
