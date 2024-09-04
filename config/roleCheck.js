// roleCheck.js
module.exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    return next();
  }
  return res.status(403).json({ error: 'Access denied: Admins only.' });
};

module.exports.isDeveloper = (req, res, next) => {
  if (req.user && req.user.role === 'Developer') {
    return next();
  }
  return res.status(403).json({ error: 'Access denied: Developers only.' });
};

module.exports.isAdminOrBelongsToGroup = (req, res, next) => {
  if (req.user && (req.user.role === 'Admin' || req.user.group.equals(req.params.groupId))) {
    return next();
  }
  return res.status(403).json({ error: 'Access denied: You do not belong to this group.' });
};

module.exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/login');
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    req.flash('error', 'You are not authorized to view this page');
    return res.redirect('/login');
  };
};
