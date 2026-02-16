// Role Based Authorization

exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    console.log('roleGuard.authorize - required roles:', allowedRoles, 'user:', req.user ? req.user.role : null);
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      console.log('roleGuard.authorize - access denied');
      return res.status(403).json({ message: 'Access Denied: Insufficient permissions' });
    }
    next();
  };
};