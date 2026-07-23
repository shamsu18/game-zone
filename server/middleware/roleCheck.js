// Role-based access control middleware.
// Usage: router.get('/x', protect, authorize('admin'), handler)
//        router.get('/y', protect, authorize('admin', 'staff'), handler)
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(`Role '${req.user.role}' is not allowed to access this resource`)
      );
    }
    next();
  };
};

// Ensures a staff member has a specific fine-grained permission (admins bypass).
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized'));
    }
    if (req.user.role === 'admin') return next();
    if (
      req.user.role === 'staff' &&
      req.user.permissions?.includes(permission)
    ) {
      return next();
    }
    res.status(403);
    return next(new Error(`Missing permission: ${permission}`));
  };
};
