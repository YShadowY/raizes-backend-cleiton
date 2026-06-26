const { Model, DataTypes } = require("sequelize");

class Estoque extends Model {
  static initModel(sequelize) {
    Estoque.init(
      {
        unidadeId: {
          type: DataTypes.INTEGER,
          field: "unidade_id"
        },
        produtoId: {
          type: DataTypes.INTEGER,
          field: "produto_id"
        },
        quantidade: DataTypes.INTEGER,
        estoqueMinimo: {
          type: DataTypes.INTEGER,
          field: "estoque_minimo"
        }
      },
      {
        sequelize,
        tableName: "estoques",
        underscored: true
      }
    );

    return Estoque;
  }

  static associate(models) {
    Estoque.belongsTo(models.Unidade, {
      foreignKey: "unidadeId",
      as: "unidade"
    });

    Estoque.belongsTo(models.Produto, {
      foreignKey: "produtoId",
      as: "produto"
    });
  }
}

module.exports = Estoque;