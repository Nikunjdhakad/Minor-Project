/**
 * Admin-only middleware.
 * Must be used AFTER the `protect` middleware so that req.user is already set.
 */
const adminProtect = (req, res, next) => {
  if (req.user && req.user.isAdmin === true) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin privileges required." });
  }
};

module.exports = { adminProtect };
