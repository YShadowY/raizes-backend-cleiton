const jwt = require("jsonwebtoken");

const { Usuario } = require("../models");
const AppError = require("../utils/AppError");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError({
        error: "NAO_AUTENTICADO",
        message: "Token ausente ou inválido.",
        statusCode: 401
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario || !usuario.ativo) {
      throw new AppError({
        error: "NAO_AUTENTICADO",
        message: "Usuário não autenticado ou inativo.",
        statusCode: 401
      });
    }

    req.user = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role
    };

    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(
        new AppError({
          error: "NAO_AUTENTICADO",
          message: "Token ausente, inválido ou expirado.",
          statusCode: 401
        })
      );
    }

    return next(error);
  }
}

module.exports = authMiddleware;