const { Router } = require("express");

const routes = Router();

routes.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "raizes-backend-cleiton",
    aluno: "Cleiton Maciel dos Santos",
    ru: "4714366",
    timestamp: new Date().toISOString()
  });
});

module.exports = routes;