const { Model, DataTypes } = require("sequelize");

class Pedido extends Model {
  static initModel(sequelize) {
    Pedido.init(
      {
        clienteId: {
          type: DataTypes.INTEGER,
          field: "cliente_id"
        },
        unidadeId: {
          type: DataTypes.INTEGER,
          field: "unidade_id"
        },
        canalPedido: {
          type: DataTypes.ENUM("APP", "TOTEM", "BALCAO", "PICKUP", "WEB"),
          field: "canal_pedido"
        },
        status: DataTypes.ENUM(
          "AGUARDANDO_PAGAMENTO",
          "PAGO",
          "EM_PREPARO",
          "PRONTO",
          "ENTREGUE",
          "CANCELADO",
          "PAGAMENTO_RECUSADO"
        ),
        formaPagamento: {
          type: DataTypes.ENUM("MOCK", "PIX", "CARTAO", "DINHEIRO"),
          field: "forma_pagamento"
        },
        total: DataTypes.DECIMAL(10, 2),
        observacao: DataTypes.TEXT
      },
      {
        sequelize,
        tableName: "pedidos",
        underscored: true
      }
    );

    return Pedido;
  }

  static associate(models) {
    Pedido.belongsTo(models.Cliente, {
      foreignKey: "clienteId",
      as: "cliente"
    });

    Pedido.belongsTo(models.Unidade, {
      foreignKey: "unidadeId",
      as: "unidade"
    });

    Pedido.hasMany(models.ItemPedido, {
      foreignKey: "pedidoId",
      as: "itens"
    });

    Pedido.hasOne(models.Pagamento, {
      foreignKey: "pedidoId",
      as: "pagamento"
    });

    Pedido.hasMany(models.MovimentoFidelidade, {
      foreignKey: "pedidoId",
      as: "movimentosFidelidade"
    });
  }
}

module.exports = Pedido;