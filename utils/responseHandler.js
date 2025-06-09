async function handleSuccess(
  data,
  message = "Operation successful",
  status = 200
) {
  return {
    success: true,
    status,
    message,
    data,
  };
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

module.exports = { handleSuccess, handleError };
