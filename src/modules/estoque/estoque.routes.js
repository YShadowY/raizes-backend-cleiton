const { Router } = require("express");

const asyncHandler = require("../../utils/asyncHandler");
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const estoqueController = require("./estoque.controller");

const routes = Router();

routes.get(
  "/unidades/:unidadeId/estoque",
  authMiddleware,
  roleMiddleware(["ADMIN", "GERENTE", "ATENDENTE", "COZINHA"]),
  asyncHandler(estoqueController.consultarPorUnidade)
);

routes.post(
  "/estoque/movimentacoes",
  authMiddleware,
  roleMiddleware(["ADMIN", "GERENTE"]),
  asyncHandler(estoqueController.movimentar)
);

module.exports = routes;