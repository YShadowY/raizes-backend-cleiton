const { Router } = require("express");

const authRoutes = require("./modules/auth/auth.routes");
const unidadesRoutes = require("./modules/unidades/unidades.routes");
const produtosRoutes = require("./modules/produtos/produtos.routes");
const estoqueRoutes = require("./modules/estoque/estoque.routes");
const pedidosRoutes = require("./modules/pedidos/pedidos.routes");
const auditoriaRoutes = require("./modules/auditoria/auditoria.routes");

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
routes.use("/unidades", unidadesRoutes);
routes.use("/produtos", produtosRoutes);
routes.use("/", estoqueRoutes);
routes.use("/pedidos", pedidosRoutes);
routes.use("/auditoria", auditoriaRoutes);

routes.get("/usuarios/me", authMiddleware, (req, res) => {
  return res.status(200).json({
    user: req.user
  });
});

module.exports = routes;