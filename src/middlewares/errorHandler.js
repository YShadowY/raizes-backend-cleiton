function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  const response = {
    error: err.error || "ERRO_INTERNO",
    message: err.message || "Erro interno do servidor.",
    details: err.details || [],
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}

module.exports = errorHandler;