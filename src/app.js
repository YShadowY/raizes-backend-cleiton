require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");

const routes = require("./routes");
const swaggerSpec = require("./config/swagger");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", routes);

app.use((req, res) => {
  return res.status(404).json({
    error: "ROTA_NAO_ENCONTRADA",
    message: "A rota informada não foi encontrada.",
    details: [],
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

app.use(errorHandler);

module.exports = app;