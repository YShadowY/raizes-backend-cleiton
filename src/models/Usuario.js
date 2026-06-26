const { Model, DataTypes } = require("sequelize");

class Usuario extends Model {
  static initModel(sequelize) {
    Usuario.init(
      {
        nome: DataTypes.STRING,
        email: DataTypes.STRING,
        senhaHash: {
          type: DataTypes.STRING,
          field: "senha_hash"
        },
        role: DataTypes.ENUM("ADMIN", "GERENTE", "ATENDENTE", "COZINHA", "CLIENTE"),
        ativo: DataTypes.BOOLEAN
      },
      {
        sequelize,
        tableName: "usuarios",
        underscored: true
      }
    );

    return Usuario;
  }

  static associate(models) {
    Usuario.hasOne(models.Cliente, {
      foreignKey: "usuarioId",
      as: "cliente"
    });

    Usuario.hasMany(models.AuditoriaLog, {
      foreignKey: "usuarioId",
      as: "logsAuditoria"
    });
  }
}

module.exports = Usuario;