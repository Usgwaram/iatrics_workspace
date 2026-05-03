class ApiContract {
  static success(data, message = "Success") {
    return {
      success: true,
      message,
      data,
      error: null,
    };
  }

  static fail(message = "Error", code = "GENERIC_ERROR") {
    return {
      success: false,
      message,
      data: null,
      error: {
        code,
        details: null,
      },
    };
  }
}

module.exports = ApiContract;