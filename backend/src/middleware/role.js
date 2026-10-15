/**
 * Role-Based Access Control (RBAC) Middleware
 */

const { AuthorizationError } = require('../errors/AppError');

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required to verify permissions'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AuthorizationError(`Forbidden: Role '${req.user.role}' is not authorized to access this resource`));
    }

    next();
  };
};

module.exports = {
  requireRole,
};
