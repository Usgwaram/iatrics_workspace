const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/secrets");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, jwtSecret());

    req.user = decoded;
    next();

  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
