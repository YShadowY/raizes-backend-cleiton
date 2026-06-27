const { Router } = require("express");

const asyncHandler = require("../../utils/asyncHandler");
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const produtosController = require("./produtos.controller");

const routes = Router();

routes.get("/", authMiddleware, asyncHandler(produtosController.listar));

routes.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "GERENTE"]),
  asyncHandler(produtosController.criar)
);

module.exports = routes;