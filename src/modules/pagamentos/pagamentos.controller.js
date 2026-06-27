const pagamentosService = require("./pagamentos.service");

function montarContexto(req) {
  return {
    usuarioId: req.user ? req.user.id : null,
    ip: req.ip,
    userAgent: req.headers["user-agent"] || null
  };
}

async function processarMock(req, res) {
  const resultado = await pagamentosService.processarPagamentoMock(
    req.params.pedidoId,
    montarContexto(req)
  );

  return res.status(200).json(resultado);
}

module.exports = {
  processarMock
};