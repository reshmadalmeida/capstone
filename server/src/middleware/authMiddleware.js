const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log('authMiddleware.protect - Authorization header:', req.headers.authorization);
  console.log('authMiddleware.protect - parsed token:', !!token);
  if (!token) {
    return res.status(401).json({ error: "Not Authorized" });
  }
  try {
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(verifiedToken.id);
    console.log('authMiddleware.protect - user found:', req.user ? req.user.username : null);
    next();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};