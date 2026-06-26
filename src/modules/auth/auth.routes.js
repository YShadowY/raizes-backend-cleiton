const { Router } = require("express");

const asyncHandler = require("../../utils/asyncHandler");
const authController = require("./auth.controller");

const routes = Router();

routes.post("/registro", asyncHandler(authController.registrar));
routes.post("/login", asyncHandler(authController.login));

module.exports = routes;