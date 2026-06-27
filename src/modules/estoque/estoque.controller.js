const estoqueService = require("./estoque.service");

async function consultarPorUnidade(req, res) {
  const resultado = await estoqueService.consultarEstoquePorUnidade(req.params.unidadeId);
  return res.status(200).json(resultado);
}

async function movimentar(req, res) {
  const resultado = await estoqueService.movimentarEstoque(req.body);
  return res.status(200).json(resultado);
}

module.exports = {
  consultarPorUnidade,
  movimentar
};