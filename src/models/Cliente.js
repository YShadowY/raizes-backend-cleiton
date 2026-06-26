const { Model, DataTypes } = require("sequelize");

class Cliente extends Model {
  static initModel(sequelize) {
    Cliente.init(
      {
        usuarioId: {
          type: DataTypes.INTEGER,
          field: "usuario_id"
        },
        nome: DataTypes.STRING,
        email: DataTypes.STRING,
        telefone: DataTypes.STRING,
        consentimentoLgpd: {
          type: DataTypes.BOOLEAN,
          field: "consentimento_lgpd"
        },
        dataConsentimento: {
          type: DataTypes.DATE,
          field: "data_consentimento"
        }
      },
      {
        sequelize,
        tableName: "clientes",
        underscored: true
      }
    );

    return Cliente;
  }

  static associate(models) {
    Cliente.belongsTo(models.Usuario, {
      foreignKey: "usuarioId",
      as: "usuario"
    });

    Cliente.hasMany(models.Pedido, {
      foreignKey: "clienteId",
      as: "pedidos"
    });

    Cliente.hasOne(models.ContaFidelidade, {
      foreignKey: "clienteId",
      as: "contaFidelidade"
    });
  }
}

module.exports = Cliente;