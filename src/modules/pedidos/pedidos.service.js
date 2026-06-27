const {
  sequelize,
  Cliente,
  Unidade,
  Produto,
  Estoque,
  Pedido,
  ItemPedido,
  Pagamento
} = require("../../models");

const AppError = require("../../utils/AppError");
const auditoriaService = require("../auditoria/auditoria.service");

const CANAIS_VALIDOS = ["APP", "TOTEM", "BALCAO", "PICKUP", "WEB"];

const STATUS_VALIDOS = [
  "AGUARDANDO_PAGAMENTO",
  "PAGO",
  "EM_PREPARO",
  "PRONTO",
  "ENTREGUE",
  "CANCELADO",
  "PAGAMENTO_RECUSADO"
];

const FORMAS_PAGAMENTO_VALIDAS = ["MOCK", "PIX", "CARTAO", "DINHEIRO"];

function validarItens(itens) {
  if (!Array.isArray(itens) || itens.length === 0) {
    throw new AppError({
      error: "ITENS_OBRIGATORIOS",
      message: "O pedido deve possuir pelo menos um item.",
      statusCode: 400,
      details: [
        {
          field: "itens",
          issue: "Informe uma lista com pelo menos um produto."
        }
      ]
    });
  }

  itens.forEach((item, index) => {
    if (!item.produtoId) {
      throw new AppError({
        error: "PRODUTO_OBRIGATORIO",
        message: "Cada item deve informar o produtoId.",
        statusCode: 400,
        details: [
          {
            field: `itens[${index}].produtoId`,
            issue: "Campo obrigatório."
          }
        ]
      });
    }

    if (!Number.isInteger(Number(item.quantidade)) || Number(item.quantidade) <= 0) {
      throw new AppError({
        error: "QUANTIDADE_INVALIDA",
        message: "A quantidade de cada item deve ser um número inteiro maior que zero.",
        statusCode: 422,
        details: [
          {
            field: `itens[${index}].quantidade`,
            issue: "Informe quantidade maior que zero."
          }
        ]
      });
    }
  });
}

function validarCriacaoPedido(dados) {
  const { clienteId, unidadeId, canalPedido, formaPagamento, itens } = dados;

  const camposAusentes = [];

  if (!clienteId) camposAusentes.push("clienteId");
  if (!unidadeId) camposAusentes.push("unidadeId");
  if (!canalPedido) camposAusentes.push("canalPedido");
  if (!formaPagamento) camposAusentes.push("formaPagamento");
  if (!itens) camposAusentes.push("itens");

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

  if (!CANAIS_VALIDOS.includes(canalPedido)) {
    throw new AppError({
      error: "CANAL_PEDIDO_INVALIDO",
      message: "O canal do pedido é inválido.",
      statusCode: 422,
      details: [
        {
          field: "canalPedido",
          issue: `Use um dos valores: ${CANAIS_VALIDOS.join(", ")}`
        }
      ]
    });
  }

  if (!FORMAS_PAGAMENTO_VALIDAS.includes(formaPagamento)) {
    throw new AppError({
      error: "FORMA_PAGAMENTO_INVALIDA",
      message: "A forma de pagamento é inválida.",
      statusCode: 422,
      details: [
        {
          field: "formaPagamento",
          issue: `Use um dos valores: ${FORMAS_PAGAMENTO_VALIDAS.join(", ")}`
        }
      ]
    });
  }

  validarItens(itens);
}

async function buscarPedidoPorId(id, transaction = null) {
  const pedido = await Pedido.findByPk(id, {
    include: [
      {
        model: Cliente,
        as: "cliente",
        attributes: ["id", "nome", "email", "telefone", "consentimentoLgpd"]
      },
      {
        model: Unidade,
        as: "unidade",
        attributes: ["id", "nome", "cidade", "estado"]
      },
      {
        model: ItemPedido,
        as: "itens",
        include: [
          {
            model: Produto,
            as: "produto",
            attributes: ["id", "nome", "categoria", "precoBase"]
          }
        ]
      },
      {
        model: Pagamento,
        as: "pagamento"
      }
    ],
    transaction
  });

  if (!pedido) {
    throw new AppError({
      error: "PEDIDO_NAO_ENCONTRADO",
      message: "Pedido não encontrado.",
      statusCode: 404
    });
  }

  return pedido;
}

async function criarPedido(dados, contexto) {
  validarCriacaoPedido(dados);

  const {
    clienteId,
    unidadeId,
    canalPedido,
    formaPagamento,
    itens,
    observacao
  } = dados;

  const cliente = await Cliente.findByPk(clienteId);

  if (!cliente) {
    throw new AppError({
      error: "CLIENTE_NAO_ENCONTRADO",
      message: "Cliente não encontrado.",
      statusCode: 404
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

  const resultado = await sequelize.transaction(async (transaction) => {
    let total = 0;
    const itensCalculados = [];

    for (const item of itens) {
      const produto = await Produto.findByPk(item.produtoId, { transaction });

      if (!produto || !produto.ativo) {
        throw new AppError({
          error: "PRODUTO_NAO_ENCONTRADO",
          message: `Produto ${item.produtoId} não encontrado ou inativo.`,
          statusCode: 404
        });
      }

      const estoque = await Estoque.findOne({
        where: {
          unidadeId,
          produtoId: item.produtoId
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!estoque) {
        throw new AppError({
          error: "ESTOQUE_NAO_ENCONTRADO",
          message: `Produto ${item.produtoId} não possui estoque cadastrado nesta unidade.`,
          statusCode: 404
        });
      }

      const quantidadeSolicitada = Number(item.quantidade);
      const quantidadeDisponivel = Number(estoque.quantidade);

      if (quantidadeDisponivel < quantidadeSolicitada) {
        throw new AppError({
          error: "ESTOQUE_INSUFICIENTE",
          message: `Estoque insuficiente para o produto ${item.produtoId}.`,
          statusCode: 409,
          details: [
            {
              field: "quantidade",
              issue: `Disponível: ${quantidadeDisponivel}; solicitado: ${quantidadeSolicitada}`
            }
          ]
        });
      }

      const precoUnitario = Number(produto.precoBase);
      const subtotal = precoUnitario * quantidadeSolicitada;

      total += subtotal;

      itensCalculados.push({
        produto,
        quantidade: quantidadeSolicitada,
        precoUnitario,
        subtotal
      });
    }

    const pedido = await Pedido.create(
      {
        clienteId,
        unidadeId,
        canalPedido,
        formaPagamento,
        status: "AGUARDANDO_PAGAMENTO",
        total,
        observacao: observacao || null
      },
      { transaction }
    );

    for (const item of itensCalculados) {
      await ItemPedido.create(
        {
          pedidoId: pedido.id,
          produtoId: item.produto.id,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          subtotal: item.subtotal
        },
        { transaction }
      );
    }

    await Pagamento.create(
      {
        pedidoId: pedido.id,
        statusPagamento: "PENDENTE",
        valor: total,
        transacaoId: null,
        payloadMock: null,
        processadoEm: null
      },
      { transaction }
    );

    await auditoriaService.registrarAuditoria({
      usuarioId: contexto.usuarioId,
      acao: "CRIAR_PEDIDO",
      entidade: "Pedido",
      entidadeId: pedido.id,
      detalhes: {
        clienteId,
        unidadeId,
        canalPedido,
        formaPagamento,
        total,
        itens: itens.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade
        }))
      },
      ip: contexto.ip,
      userAgent: contexto.userAgent,
      transaction
    });

    return buscarPedidoPorId(pedido.id, transaction);
  });

  return resultado;
}

async function listarPedidos(filtros = {}) {
  const where = {};

  if (filtros.canalPedido) {
    if (!CANAIS_VALIDOS.includes(filtros.canalPedido)) {
      throw new AppError({
        error: "CANAL_PEDIDO_INVALIDO",
        message: "O canal do pedido é inválido.",
        statusCode: 422
      });
    }

    where.canalPedido = filtros.canalPedido;
  }

  if (filtros.status) {
    if (!STATUS_VALIDOS.includes(filtros.status)) {
      throw new AppError({
        error: "STATUS_INVALIDO",
        message: "O status informado é inválido.",
        statusCode: 422
      });
    }

    where.status = filtros.status;
  }

  const pedidos = await Pedido.findAll({
    where,
    include: [
      {
        model: Cliente,
        as: "cliente",
        attributes: ["id", "nome", "email"]
      },
      {
        model: Unidade,
        as: "unidade",
        attributes: ["id", "nome", "cidade", "estado"]
      },
      {
        model: Pagamento,
        as: "pagamento",
        attributes: ["id", "statusPagamento", "valor", "transacaoId", "processadoEm"]
      }
    ],
    order: [["id", "DESC"]]
  });

  return pedidos;
}

async function atualizarStatusPedido(id, novoStatus, contexto) {
  if (!novoStatus) {
    throw new AppError({
      error: "STATUS_OBRIGATORIO",
      message: "O novo status do pedido é obrigatório.",
      statusCode: 400
    });
  }

  if (!STATUS_VALIDOS.includes(novoStatus)) {
    throw new AppError({
      error: "STATUS_INVALIDO",
      message: "O status informado é inválido.",
      statusCode: 422
    });
  }

  const resultado = await sequelize.transaction(async (transaction) => {
    const pedido = await Pedido.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!pedido) {
      throw new AppError({
        error: "PEDIDO_NAO_ENCONTRADO",
        message: "Pedido não encontrado.",
        statusCode: 404
      });
    }

    const statusAnterior = pedido.status;

    await pedido.update(
      {
        status: novoStatus
      },
      { transaction }
    );

    await auditoriaService.registrarAuditoria({
      usuarioId: contexto.usuarioId,
      acao: "ATUALIZAR_STATUS_PEDIDO",
      entidade: "Pedido",
      entidadeId: pedido.id,
      detalhes: {
        statusAnterior,
        novoStatus
      },
      ip: contexto.ip,
      userAgent: contexto.userAgent,
      transaction
    });

    return buscarPedidoPorId(pedido.id, transaction);
  });

  return resultado;
}

async function cancelarPedido(id, contexto) {
  const resultado = await sequelize.transaction(async (transaction) => {
    const pedido = await Pedido.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!pedido) {
      throw new AppError({
        error: "PEDIDO_NAO_ENCONTRADO",
        message: "Pedido não encontrado.",
        statusCode: 404
      });
    }

    if (["ENTREGUE", "CANCELADO"].includes(pedido.status)) {
      throw new AppError({
        error: "CANCELAMENTO_INVALIDO",
        message: "Pedido entregue ou já cancelado não pode ser cancelado.",
        statusCode: 409
      });
    }

    const statusAnterior = pedido.status;

    await pedido.update(
      {
        status: "CANCELADO"
      },
      { transaction }
    );

    await auditoriaService.registrarAuditoria({
      usuarioId: contexto.usuarioId,
      acao: "CANCELAR_PEDIDO",
      entidade: "Pedido",
      entidadeId: pedido.id,
      detalhes: {
        statusAnterior,
        novoStatus: "CANCELADO"
      },
      ip: contexto.ip,
      userAgent: contexto.userAgent,
      transaction
    });

    return buscarPedidoPorId(pedido.id, transaction);
  });

  return resultado;
}

module.exports = {
  criarPedido,
  listarPedidos,
  buscarPedidoPorId,
  atualizarStatusPedido,
  cancelarPedido
};