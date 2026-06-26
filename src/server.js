const app = require("./app");
const sequelize = require("./config/sequelize");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();

    console.log("Banco de dados conectado com sucesso.");

    app.listen(PORT, () => {
      console.log(`API Raízes do Nordeste rodando na porta ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Erro ao iniciar servidor:", error);
    process.exit(1);
  }
}

startServer();