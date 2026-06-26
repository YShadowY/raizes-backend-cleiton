const { Model, DataTypes } = require("sequelize");

class Promocao extends Model {
  static initModel(sequelize) {
    Promocao.init(
      {
        nome: DataTypes.STRING,
        descricao: DataTypes.TEXT,
        percentualDesconto: {
          type: DataTypes.DECIMAL(5, 2),
          field: "percentual_desconto"
        },
        ativa: DataTypes.BOOLEAN,
        dataInicio: {
          type: DataTypes.DATE,
          field: "data_inicio"
        },
        dataFim: {
          type: DataTypes.DATE,
          field: "data_fim"
        }
      },
      {
        sequelize,
        tableName: "promocoes",
        underscored: true
      }
    );

    return Promocao;
  }
}

module.exports = Promocao;