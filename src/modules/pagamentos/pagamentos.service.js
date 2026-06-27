const crypto = require("crypto");

const {
  sequelize,
  Pedido,
  ItemPedido,
  Produto,
  Pagamento,
  Estoque,
  Cliente,
  ContaFidelidade,
  MovimentoFidelidade
} = require("../../models");

const AppError = require("../../utils/AppError");
const auditoriaService = require("../auditoria/auditoria.service");

function gerarTransacaoId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function decidirPagamentoMock(valor) {
  const valorNumerico = Number(valor);

  if (valorNumerico <= 1000) {
    return {
      aprovado: true,
      statusPagamento: "APROVADO",
      mensagem: "Pagamento aprovado com sucesso.",
      codigoMock: "MOCK_APPROVED"
    };
  }

  return {
    aprovado: false,
    statusPagamento: "RECUSADO",
    mensagem: "Pagamento recusado: valor acima do limite permitido pelo mock.",
    codigoMock: "MOCK_DECLINED_LIMIT"
  };
}

async function carregarPedidoParaPagamento(pedidoId, transaction) {
  const idNumerico = Number(pedidoId);

  if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
    throw new AppError({
      error: "PEDIDO_ID_INVALIDO",
      message: "O ID do pedido deve ser um número inteiro válido.",
      statusCode: 400,
      details: [
        {
          field: "pedidoId",
          issue: "Informe um ID numérico válido."
        }
      ]
    });
  }

  const pedido = await Pedido.findByPk(idNumerico, {
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

  const itens = await ItemPedido.findAll({
    where: {
      pedidoId: pedido.id
    },
    include: [
      {
        model: Produto,
        as: "produto",
        attributes: ["id", "nome", "precoBase"]
      }
    ],
    transaction
  });

  const pagamento = await Pagamento.findOne({
    where: {
      pedidoId: pedido.id
    },
    transaction,
    lock: transaction.LOCK.UPDATE
  });

  const cliente = await Cliente.findByPk(pedido.clienteId, {
    attributes: ["id", "nome", "email", "consentimentoLgpd"],
    transaction
  });

  pedido.itens = itens;
  pedido.pagamento = pagamento;
  pedido.cliente = cliente;

  return pedido;
}

async function debitarEstoqueDoPedido(pedido, transaction) {
  for (const item of pedido.itens) {
    const estoque = await Estoque.findOne({
      where: {
        unidadeId: pedido.unidadeId,
        produtoId: item.produtoId
      },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!estoque) {
      throw new AppError({
        error: "ESTOQUE_NAO_ENCONTRADO",
        message: `Estoque não encontrado para o produto ${item.produtoId}.`,
        statusCode: 404
      });
    }

    const saldoAtual = Number(estoque.quantidade);
    const quantidadeItem = Number(item.quantidade);

    if (saldoAtual < quantidadeItem) {
      throw new AppError({
        error: "ESTOQUE_INSUFICIENTE",
        message: `Estoque insuficiente para o produto ${item.produtoId}.`,
        statusCode: 409,
        details: [
          {
            field: "quantidade",
            issue: `Disponível: ${saldoAtual}; necessário: ${quantidadeItem}`
          }
        ]
      });
    }

    await estoque.update(
      {
        quantidade: saldoAtual - quantidadeItem
      },
      { transaction }
    );
  }
}

async function creditarFidelidade(pedido, transaction) {
  const cliente = pedido.cliente;

  if (!cliente || !cliente.consentimentoLgpd) {
    return {
      pontosGerados: 0,
      motivo: "Cliente sem consentimento LGPD para fidelidade."
    };
  }

  const pontosGerados = Math.floor(Number(pedido.total));

  if (pontosGerados <= 0) {
    return {
      pontosGerados: 0,
      motivo: "Pedido sem valor suficiente para gerar pontos."
    };
  }

  const [conta] = await ContaFidelidade.findOrCreate({
    where: {
      clienteId: pedido.clienteId
    },
    defaults: {
      clienteId: pedido.clienteId,
      saldoPontos: 0
    },
    transaction,
    lock: transaction.LOCK.UPDATE
  });

  const saldoAtual = Number(conta.saldoPontos);
  const novoSaldo = saldoAtual + pontosGerados;

  await conta.update(
    {
      saldoPontos: novoSaldo
    },
    { transaction }
  );

  await MovimentoFidelidade.create(
    {
      contaFidelidadeId: conta.id,
      pedidoId: pedido.id,
      tipo: "CREDITO",
      pontos: pontosGerados,
      descricao: `Crédito de ${pontosGerados} pontos pelo pedido ${pedido.id}.`
    },
    { transaction }
  );

  return {
    pontosGerados,
    saldoAtualizado: novoSaldo
  };
}

async function processarPagamentoMock(pedidoId, contexto) {
  const resultado = await sequelize.transaction(async (transaction) => {
    const pedido = await carregarPedidoParaPagamento(pedidoId, transaction);

    if (pedido.status !== "AGUARDANDO_PAGAMENTO") {
      throw new AppError({
        error: "STATUS_INVALIDO",
        message: "Pedido não está aguardando pagamento.",
        statusCode: 409,
        details: [
          {
            field: "status",
            issue: `Status atual: ${pedido.status}`
          }
        ]
      });
    }

    if (!pedido.pagamento) {
      throw new AppError({
        error: "PAGAMENTO_NAO_ENCONTRADO",
        message: "Registro de pagamento não encontrado para este pedido.",
        statusCode: 404
      });
    }

    if (pedido.pagamento.statusPagamento !== "PENDENTE") {
      throw new AppError({
        error: "PAGAMENTO_JA_PROCESSADO",
        message: "O pagamento deste pedido já foi processado.",
        statusCode: 409
      });
    }

    const decisao = decidirPagamentoMock(pedido.total);
    const transacaoId = gerarTransacaoId();

    const payloadMock = {
      gateway: "MOCK_RAIZES",
      codigo: decisao.codigoMock,
      aprovado: decisao.aprovado,
      valor: Number(pedido.total),
      transacaoId,
      processadoEm: new Date().toISOString()
    };

    let fidelidade = {
      pontosGerados: 0
    };

    if (decisao.aprovado) {
      await debitarEstoqueDoPedido(pedido, transaction);

      await pedido.update(
        {
          status: "PAGO"
        },
        { transaction }
      );

      await pedido.pagamento.update(
        {
          statusPagamento: "APROVADO",
          transacaoId,
          payloadMock,
          processadoEm: new Date()
        },
        { transaction }
      );

      fidelidade = await creditarFidelidade(pedido, transaction);
    } else {
      await pedido.update(
        {
          status: "PAGAMENTO_RECUSADO"
        },
        { transaction }
      );

      await pedido.pagamento.update(
        {
          statusPagamento: "RECUSADO",
          transacaoId,
          payloadMock,
          processadoEm: new Date()
        },
        { transaction }
      );
    }

    await auditoriaService.registrarAuditoria({
      usuarioId: contexto.usuarioId,
      acao: "PROCESSAR_PAGAMENTO_MOCK",
      entidade: "Pedido",
      entidadeId: pedido.id,
      detalhes: {
        pedidoId: pedido.id,
        valor: Number(pedido.total),
        statusPagamento: decisao.statusPagamento,
        novoStatusPedido: decisao.aprovado ? "PAGO" : "PAGAMENTO_RECUSADO",
        transacaoId,
        fidelidade
      },
      ip: contexto.ip,
      userAgent: contexto.userAgent,
      transaction
    });

    return {
      statusPagamento: decisao.statusPagamento,
      pedidoId: pedido.id,
      novoStatusPedido: decisao.aprovado ? "PAGO" : "PAGAMENTO_RECUSADO",
      mensagem: decisao.mensagem,
      transacaoId,
      valor: Number(pedido.total),
      fidelidade
    };
  });

  return resultado;
}

module.exports = {
  processarPagamentoMock
};