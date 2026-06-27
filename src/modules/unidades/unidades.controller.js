const unidadesService = require("./unidades.service");

async function listar(req, res) {
  const unidades = await unidadesService.listarUnidades();
  return res.status(200).json({ total: unidades.length, unidades });
}

async function criar(req, res) {
  const unidade = await unidadesService.criarUnidade(req.body);
  return res.status(201).json(unidade);
}

async function cardapio(req, res) {
  const resultado = await unidadesService.consultarCardapioPorUnidade(req.params.unidadeId);
  return res.status(200).json(resultado);
}

module.exports = {
  listar,
  criar,
  cardapio
};