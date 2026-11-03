export function errorHandler(err, req, res, next) {
  console.error(`[AuraTech API Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.status || err.statusCode || 500;
  const errorResponse = {
    type: err.type || 'https://auratech.io/errors/internal-server-error',
    title: err.title || (statusCode === 500 ? 'Internal Server Error' : 'Request Error'),
    status: statusCode,
    detail: err.message || 'An unexpected error occurred processing your request',
    instance: req.originalUrl,
    timestamp: new Date().toISOString()
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}
