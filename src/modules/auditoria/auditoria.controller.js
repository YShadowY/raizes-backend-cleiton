const auditoriaService = require("./auditoria.service");

async function listar(req, res) {
  const logs = await auditoriaService.listarAuditoria();

  return res.status(200).json({
    total: logs.length,
    logs
  });
}

module.exports = {
  listar
};