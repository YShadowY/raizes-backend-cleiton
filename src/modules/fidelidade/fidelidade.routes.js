const { Router } = require("express");

const asyncHandler = require("../../utils/asyncHandler");
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const fidelidadeController = require("./fidelidade.controller");

const routes = Router();

routes.get(
  "/clientes/:clienteId/fidelidade",
  authMiddleware,
  roleMiddleware(["ADMIN", "GERENTE", "ATENDENTE", "CLIENTE"]),
  asyncHandler(fidelidadeController.consultar)
);

routes.post(
  "/clientes/:clienteId/fidelidade/resgatar",
  authMiddleware,
  roleMiddleware(["ADMIN", "GERENTE", "ATENDENTE"]),
  asyncHandler(fidelidadeController.resgatar)
);

module.exports = routes;