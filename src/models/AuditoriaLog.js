const { Model, DataTypes } = require("sequelize");

class AuditoriaLog extends Model {
  static initModel(sequelize) {
    AuditoriaLog.init(
      {
        usuarioId: {
          type: DataTypes.INTEGER,
          field: "usuario_id"
        },
        acao: DataTypes.STRING,
        entidade: DataTypes.STRING,
        entidadeId: {
          type: DataTypes.INTEGER,
          field: "entidade_id"
        },
        detalhes: DataTypes.JSONB,
        ip: DataTypes.STRING,
        userAgent: {
          type: DataTypes.STRING,
          field: "user_agent"
        }
      },
      {
        sequelize,
        tableName: "auditoria_logs",
        underscored: true
      }
    );

    return AuditoriaLog;
  }

  static associate(models) {
    AuditoriaLog.belongsTo(models.Usuario, {
      foreignKey: "usuarioId",
      as: "usuario"
    });
  }
}

module.exports = AuditoriaLog;