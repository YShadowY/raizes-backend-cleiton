const { Model, DataTypes } = require("sequelize");

class Unidade extends Model {
  static initModel(sequelize) {
    Unidade.init(
      {
        nome: DataTypes.STRING,
        cidade: DataTypes.STRING,
        estado: DataTypes.STRING,
        endereco: DataTypes.STRING,
        ativa: DataTypes.BOOLEAN
      },
      {
        sequelize,
        tableName: "unidades",
        underscored: true
      }
    );

    return Unidade;
  }

  static associate(models) {
    Unidade.hasMany(models.Estoque, {
      foreignKey: "unidadeId",
      as: "estoques"
    });

    Unidade.hasMany(models.Pedido, {
      foreignKey: "unidadeId",
      as: "pedidos"
    });
  }
}

module.exports = Unidade;