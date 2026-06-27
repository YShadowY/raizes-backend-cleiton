const { sequelize, Estoque, Unidade, Produto } = require("../../models");
const AppError = require("../../utils/AppError");

async function consultarEstoquePorUnidade(unidadeId) {
  const unidade = await Unidade.findByPk(unidadeId);

  if (!unidade) {
    throw new AppError({
      error: "UNIDADE_NAO_ENCONTRADA",
      message: "Unidade não encontrada.",
      statusCode: 404
    });
  }

  const estoques = await Estoque.findAll({
    where: { unidadeId },
    include: [
      {
        model: Produto,
        as: "produto",
        attributes: ["id", "nome", "categoria", "precoBase", "ativo"]
      }
    ],
    order: [["produtoId", "ASC"]]
  });

  return {
    unidade: {
      id: unidade.id,
      nome: unidade.nome
    },
    total: estoques.length,
    estoques
  };
}

async function movimentarEstoque(dados) {
  const { unidadeId, produtoId, tipo, quantidade } = dados;

  const camposAusentes = [];

  if (!unidadeId) camposAusentes.push("unidadeId");
  if (!produtoId) camposAusentes.push("produtoId");
  if (!tipo) camposAusentes.push("tipo");
  if (quantidade === undefined || quantidade === null) camposAusentes.push("quantidade");

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

  if (!["ENTRADA", "SAIDA"].includes(tipo)) {
    throw new AppError({
      error: "TIPO_MOVIMENTO_INVALIDO",
      message: "O tipo de movimento deve ser ENTRADA ou SAIDA.",
      statusCode: 422
    });
  }

  if (!Number.isInteger(Number(quantidade)) || Number(quantidade) <= 0) {
    throw new AppError({
      error: "QUANTIDADE_INVALIDA",
      message: "A quantidade deve ser um número inteiro maior que zero.",
      statusCode: 422
    });
  }

  const unidade = await Unidade.findByPk(unidadeId);
  if (!unidade) {
    throw new AppError({
      error: "UNIDADE_NAO_ENCONTRADA",
      message: "Unidade não encontrada.",
      statusCode: 404
    });
  }

  const produto = await Produto.findByPk(produtoId);
  if (!produto) {
    throw new AppError({
      error: "PRODUTO_NAO_ENCONTRADO",
      message: "Produto não encontrado.",
      statusCode: 404
    });
  }

  const resultado = await sequelize.transaction(async (transaction) => {
    const [estoque] = await Estoque.findOrCreate({
      where: { unidadeId, produtoId },
      defaults: {
        unidadeId,
        produtoId,
        quantidade: 0,
        estoqueMinimo: 0
      },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    const saldoAtual = Number(estoque.quantidade);
    const qtd = Number(quantidade);

    if (tipo === "SAIDA" && saldoAtual < qtd) {
      throw new AppError({
        error: "ESTOQUE_INSUFICIENTE",
        message: "Não há estoque suficiente para realizar a saída.",
        statusCode: 409,
        details: [
          {
            field: "quantidade",
            issue: `Saldo atual: ${saldoAtual}`
          }
        ]
      });
    }

    const novoSaldo = tipo === "ENTRADA" ? saldoAtual + qtd : saldoAtual - qtd;

    await estoque.update(
      {
        quantidade: novoSaldo
      },
      { transaction }
    );

    return estoque;
  });

  return {
    message: "Movimentação de estoque realizada com sucesso.",
    estoque: resultado
  };
}

module.exports = {
  consultarEstoquePorUnidade,
  movimentarEstoque
};