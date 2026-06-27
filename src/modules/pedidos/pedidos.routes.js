const { Router } = require("express");

const asyncHandler = require("../../utils/asyncHandler");
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const pedidosController = require("./pedidos.controller");

const routes = Router();

routes.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "GERENTE", "ATENDENTE", "CLIENTE"]),
  asyncHandler(pedidosController.criar)
);

routes.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "GERENTE", "ATENDENTE", "COZINHA", "CLIENTE"]),
  asyncHandler(pedidosController.listar)
);

routes.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "GERENTE", "ATENDENTE", "COZINHA", "CLIENTE"]),
  asyncHandler(pedidosController.buscarPorId)
);

routes.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["ADMIN", "GERENTE", "COZINHA"]),
  asyncHandler(pedidosController.atualizarStatus)
);

routes.patch(
  "/:id/cancelar",
  authMiddleware,
  roleMiddleware(["ADMIN", "GERENTE", "ATENDENTE"]),
  asyncHandler(pedidosController.cancelar)
);

module.exports = routes;