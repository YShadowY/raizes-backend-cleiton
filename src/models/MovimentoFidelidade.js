const { Model, DataTypes } = require("sequelize");

class MovimentoFidelidade extends Model {
  static initModel(sequelize) {
    MovimentoFidelidade.init(
      {
        contaFidelidadeId: {
          type: DataTypes.INTEGER,
          field: "conta_fidelidade_id"
        },
        pedidoId: {
          type: DataTypes.INTEGER,
          field: "pedido_id"
        },
        tipo: DataTypes.ENUM("CREDITO", "RESGATE"),
        pontos: DataTypes.INTEGER,
        descricao: DataTypes.STRING
      },
      {
        sequelize,
        tableName: "movimentos_fidelidade",
        underscored: true
      }
    );

    return MovimentoFidelidade;
  }

  static associate(models) {
    MovimentoFidelidade.belongsTo(models.ContaFidelidade, {
      foreignKey: "contaFidelidadeId",
      as: "contaFidelidade"
    });

    MovimentoFidelidade.belongsTo(models.Pedido, {
      foreignKey: "pedidoId",
      as: "pedido"
    });
  }
}

module.exports = MovimentoFidelidade;