const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.username === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Admin access required'
  });
};

module.exports = {
  isAuthenticated,
  isAdmin
}; 