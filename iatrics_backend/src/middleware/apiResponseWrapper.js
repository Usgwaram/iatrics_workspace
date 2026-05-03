const ApiContract = require("../contracts/apiContract");

module.exports = (req, res, next) => {
  res.success = (data, message) =>
    res.json(ApiContract.success(data, message));

  res.fail = (message, code = "ERROR", status = 400) =>
    res.status(status).json(ApiContract.fail(message, code));

  next();
};