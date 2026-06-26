const AppError = require("../utils/AppError");

function roleMiddleware(rolesPermitidas = []) {
  return function validarRole(req, res, next) {
    if (!req.user) {
      return next(
        new AppError({
          error: "NAO_AUTENTICADO",
          message: "Usuário não autenticado.",
          statusCode: 401
        })
      );
    }

    if (!rolesPermitidas.includes(req.user.role)) {
      return next(
        new AppError({
          error: "SEM_PERMISSAO",
          message: "Usuário não possui permissão para executar esta ação.",
          statusCode: 403,
          details: [
            {
              field: "role",
              issue: `Perfil atual: ${req.user.role}. Perfis permitidos: ${rolesPermitidas.join(", ")}`
            }
          ]
        })
      );
    }

    return next();
  };
}

module.exports = roleMiddleware;