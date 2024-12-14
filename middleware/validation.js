const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;

const validateToken = (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Attach decoded user data to the request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token." });
  }
};

module.exports = validateToken;