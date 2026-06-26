const { Model, DataTypes } = require("sequelize");

class Produto extends Model {
  static initModel(sequelize) {
    Produto.init(
      {
        nome: DataTypes.STRING,
        descricao: DataTypes.TEXT,
        categoria: DataTypes.STRING,
        precoBase: {
          type: DataTypes.DECIMAL(10, 2),
          field: "preco_base"
        },
        ativo: DataTypes.BOOLEAN
      },
      {
        sequelize,
        tableName: "produtos",
        underscored: true
      }
    );

    return Produto;
  }

  static associate(models) {
    Produto.hasMany(models.Estoque, {
      foreignKey: "produtoId",
      as: "estoques"
    });

    Produto.hasMany(models.ItemPedido, {
      foreignKey: "produtoId",
      as: "itensPedido"
    });
  }
}

module.exports = Produto;