const { Router } = require("express");

const authRoutes = require("./modules/auth/auth.routes");
const authMiddleware = require("./middlewares/authMiddleware");

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

routes.use("/auth", authRoutes);

routes.get("/usuarios/me", authMiddleware, (req, res) => {
  return res.status(200).json({
    user: req.user
  });
});

module.exports = routes;