// middlewares/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    // token priority: cookie 'token' (preferred) then Authorization header Bearer <token>
    
    const tokenFromCookie = req.cookies?.token;
    const header = req.headers?.authorization;
    const tokenFromHeader = header && header.startsWith("Bearer ") ? header.split(" ")[1] : null;
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized: invalid token" });
    }

    // Attach a small user object to req for routes to use
    req.user = {
      _id: user._id,
      emailId: user.emailId,
      fullName: user.fullName,
    };

    next();
  } catch (err) {
    console.warn("auth middleware error:", err.message);
    return res.status(401).json({ success: false, message: "Unauthorized: " + err.message });
  }
};

module.exports = { userAuth };
