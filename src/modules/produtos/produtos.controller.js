const produtosService = require("./produtos.service");

async function listar(req, res) {
  const produtos = await produtosService.listarProdutos();
  return res.status(200).json({ total: produtos.length, produtos });
}

async function criar(req, res) {
  const produto = await produtosService.criarProduto(req.body);
  return res.status(201).json(produto);
}

module.exports = {
  listar,
  criar
};