const { Router } = require("express");

const asyncHandler = require("../../utils/asyncHandler");
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const pagamentosController = require("./pagamentos.controller");

const routes = Router();

routes.post(
  "/mock/:pedidoId",
  authMiddleware,
  roleMiddleware(["ADMIN", "GERENTE", "ATENDENTE", "CLIENTE"]),
  asyncHandler(pagamentosController.processarMock)
);

module.exports = routes;