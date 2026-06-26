const { Model, DataTypes } = require("sequelize");

class ContaFidelidade extends Model {
  static initModel(sequelize) {
    ContaFidelidade.init(
      {
        clienteId: {
          type: DataTypes.INTEGER,
          field: "cliente_id"
        },
        saldoPontos: {
          type: DataTypes.INTEGER,
          field: "saldo_pontos"
        }
      },
      {
        sequelize,
        tableName: "contas_fidelidade",
        underscored: true
      }
    );

    return ContaFidelidade;
  }

  static associate(models) {
    ContaFidelidade.belongsTo(models.Cliente, {
      foreignKey: "clienteId",
      as: "cliente"
    });

    ContaFidelidade.hasMany(models.MovimentoFidelidade, {
      foreignKey: "contaFidelidadeId",
      as: "movimentos"
    });
  }
}

module.exports = ContaFidelidade;