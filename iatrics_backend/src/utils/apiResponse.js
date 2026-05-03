exports.success = (res, message, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
    error: null,
  });
};

exports.error = (res, message, code = "ERROR", status = 500, details = null) => {
  return res.status(status).json({
    success: false,
    message,
    data: null,
    error: {
      code,
      details,
    },
  });
};