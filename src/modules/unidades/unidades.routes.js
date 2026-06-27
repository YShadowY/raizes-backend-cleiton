const { Router } = require("express");

const asyncHandler = require("../../utils/asyncHandler");
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const unidadesController = require("./unidades.controller");

const routes = Router();

routes.get("/", authMiddleware, asyncHandler(unidadesController.listar));

routes.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "GERENTE"]),
  asyncHandler(unidadesController.criar)
);

routes.get(
  "/:unidadeId/cardapio",
  authMiddleware,
  asyncHandler(unidadesController.cardapio)
);

module.exports = routes;