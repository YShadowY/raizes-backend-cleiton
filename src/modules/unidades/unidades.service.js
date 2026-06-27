const { Unidade, Estoque, Produto } = require("../../models");
const AppError = require("../../utils/AppError");

async function listarUnidades() {
  return Unidade.findAll({
    order: [["id", "ASC"]]
  });
}

async function criarUnidade(dados) {
  const { nome, cidade, estado, endereco } = dados;

  const camposAusentes = [];

  if (!nome) camposAusentes.push("nome");
  if (!cidade) camposAusentes.push("cidade");
  if (!estado) camposAusentes.push("estado");
  if (!endereco) camposAusentes.push("endereco");

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

  return Unidade.create({
    nome,
    cidade,
    estado,
    endereco,
    ativa: true
  });
}

async function consultarCardapioPorUnidade(unidadeId) {
  const unidade = await Unidade.findByPk(unidadeId);

  if (!unidade) {
    throw new AppError({
      error: "UNIDADE_NAO_ENCONTRADA",
      message: "Unidade não encontrada.",
      statusCode: 404
    });
  }

  const itens = await Estoque.findAll({
    where: { unidadeId },
    include: [
      {
        model: Produto,
        as: "produto",
        where: { ativo: true },
        attributes: ["id", "nome", "descricao", "categoria", "precoBase", "ativo"]
      }
    ],
    order: [["produtoId", "ASC"]]
  });

  return {
    unidade: {
      id: unidade.id,
      nome: unidade.nome,
      cidade: unidade.cidade,
      estado: unidade.estado
    },
    total: itens.length,
    produtos: itens.map((item) => ({
      produtoId: item.produto.id,
      nome: item.produto.nome,
      descricao: item.produto.descricao,
      categoria: item.produto.categoria,
      precoBase: Number(item.produto.precoBase),
      disponivel: item.quantidade > 0,
      quantidadeDisponivel: item.quantidade
    }))
  };
}

module.exports = {
  listarUnidades,
  criarUnidade,
  consultarCardapioPorUnidade
};