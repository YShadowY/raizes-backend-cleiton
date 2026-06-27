const { Produto } = require("../../models");
const AppError = require("../../utils/AppError");

async function listarProdutos() {
  return Produto.findAll({
    order: [["id", "ASC"]]
  });
}

async function criarProduto(dados) {
  const { nome, descricao, categoria, precoBase } = dados;

  const camposAusentes = [];

  if (!nome) camposAusentes.push("nome");
  if (!categoria) camposAusentes.push("categoria");
  if (precoBase === undefined || precoBase === null) camposAusentes.push("precoBase");

  if (camposAusentes.length > 0) {
    throw new AppError({
      error: "CAMPOS_OBRIGATORIOS",
      message: "Campos obrigatórios ausentes.",
      statusCode: 400,
      details: camposAusentes.map((field) => ({
        field,
        issue: "Campo obrigatório."
      }))
    });
  }

  if (Number(precoBase) <= 0) {
    throw new AppError({
      error: "PRECO_INVALIDO",
      message: "O preço do produto deve ser maior que zero.",
      statusCode: 422
    });
  }

  return Produto.create({
    nome,
    descricao: descricao || null,
    categoria,
    precoBase,
    ativo: true
  });
}

module.exports = {
  listarProdutos,
  criarProduto
};