// 404 handler for unmatched routes
export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

// Central error handler
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server Error';

  // Sequelize unique constraint (duplicate) error
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    const field = err.errors?.[0]?.path || 'field';
    message = `A record with that ${field} already exists`;
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = (err.errors || []).map((e) => e.message).join(', ');
  }

  // Sequelize foreign key / database errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Related record not found or still referenced';
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
