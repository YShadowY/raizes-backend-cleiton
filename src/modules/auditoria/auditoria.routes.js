const { Router } = require("express");

const asyncHandler = require("../../utils/asyncHandler");
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const auditoriaController = require("./auditoria.controller");

const routes = Router();

routes.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "GERENTE"]),
  asyncHandler(auditoriaController.listar)
);

module.exports = routes;