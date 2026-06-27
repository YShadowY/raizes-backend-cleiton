const { AuditoriaLog, Usuario } = require("../../models");

async function registrarAuditoria({
  usuarioId = null,
  acao,
  entidade,
  entidadeId = null,
  detalhes = null,
  ip = null,
  userAgent = null,
  transaction = null
}) {
  return AuditoriaLog.create(
    {
      usuarioId,
      acao,
      entidade,
      entidadeId,
      detalhes,
      ip,
      userAgent
    },
    { transaction }
  );
}

async function listarAuditoria() {
  return AuditoriaLog.findAll({
    include: [
      {
        model: Usuario,
        as: "usuario",
        attributes: ["id", "nome", "email", "role"]
      }
    ],
    order: [["id", "DESC"]],
    limit: 100
  });
}

module.exports = {
  registrarAuditoria,
  listarAuditoria
};