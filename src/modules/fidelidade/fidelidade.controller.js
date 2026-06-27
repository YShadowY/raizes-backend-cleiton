const fidelidadeService = require("./fidelidade.service");

function montarContexto(req) {
  return {
    usuarioId: req.user ? req.user.id : null,
    ip: req.ip,
    userAgent: req.headers["user-agent"] || null
  };
}

async function consultar(req, res) {
  const resultado = await fidelidadeService.consultarFidelidade(req.params.clienteId);

  return res.status(200).json(resultado);
}

async function resgatar(req, res) {
  const resultado = await fidelidadeService.resgatarPontos(
    req.params.clienteId,
    req.body,
    montarContexto(req)
  );

  return res.status(200).json(resultado);
}

module.exports = {
  consultar,
  resgatar
};