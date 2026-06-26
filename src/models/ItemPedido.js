const { Model, DataTypes } = require("sequelize");

class ItemPedido extends Model {
  static initModel(sequelize) {
    ItemPedido.init(
      {
        pedidoId: {
          type: DataTypes.INTEGER,
          field: "pedido_id"
        },
        produtoId: {
          type: DataTypes.INTEGER,
          field: "produto_id"
        },
        quantidade: DataTypes.INTEGER,
        precoUnitario: {
          type: DataTypes.DECIMAL(10, 2),
          field: "preco_unitario"
        },
        subtotal: DataTypes.DECIMAL(10, 2)
      },
      {
        sequelize,
        tableName: "itens_pedido",
        underscored: true
      }
    );

    return ItemPedido;
  }

  static associate(models) {
    ItemPedido.belongsTo(models.Pedido, {
      foreignKey: "pedidoId",
      as: "pedido"
    });

    ItemPedido.belongsTo(models.Produto, {
      foreignKey: "produtoId",
      as: "produto"
    });
  }
}

module.exports = ItemPedido;