const sequelize = require("../config/sequelize");

const Usuario = require("./Usuario");
const Cliente = require("./Cliente");
const Unidade = require("./Unidade");
const Produto = require("./Produto");
const Estoque = require("./Estoque");
const Pedido = require("./Pedido");
const ItemPedido = require("./ItemPedido");
const Pagamento = require("./Pagamento");
const ContaFidelidade = require("./ContaFidelidade");
const MovimentoFidelidade = require("./MovimentoFidelidade");
const Promocao = require("./Promocao");
const AuditoriaLog = require("./AuditoriaLog");

const models = {
  Usuario,
  Cliente,
  Unidade,
  Produto,
  Estoque,
  Pedido,
  ItemPedido,
  Pagamento,
  ContaFidelidade,
  MovimentoFidelidade,
  Promocao,
  AuditoriaLog
};

Object.values(models).forEach((model) => {
  model.initModel(sequelize);
});

Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

models.sequelize = sequelize;

module.exports = models;