const { Model, DataTypes } = require("sequelize");

class Pagamento extends Model {
  static initModel(sequelize) {
    Pagamento.init(
      {
        pedidoId: {
          type: DataTypes.INTEGER,
          field: "pedido_id"
        },
        statusPagamento: {
          type: DataTypes.ENUM("PENDENTE", "APROVADO", "RECUSADO"),
          field: "status_pagamento"
        },
        valor: DataTypes.DECIMAL(10, 2),
        transacaoId: {
          type: DataTypes.STRING,
          field: "transacao_id"
        },
        payloadMock: {
          type: DataTypes.JSONB,
          field: "payload_mock"
        },
        processadoEm: {
          type: DataTypes.DATE,
          field: "processado_em"
        }
      },
      {
        sequelize,
        tableName: "pagamentos",
        underscored: true
      }
    );

    return Pagamento;
  }

  static associate(models) {
    Pagamento.belongsTo(models.Pedido, {
      foreignKey: "pedidoId",
      as: "pedido"
    });
  }
}

module.exports = Pagamento;