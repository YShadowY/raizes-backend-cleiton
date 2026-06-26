class AppError extends Error {
  constructor({
    error = "ERRO_INTERNO",
    message = "Erro interno do servidor.",
    statusCode = 500,
    details = []
  }) {
    super(message);

    this.error = error;
    this.message = message;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

module.exports = AppError;