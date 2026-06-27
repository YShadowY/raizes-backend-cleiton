const {
  sequelize,
  Cliente,
  ContaFidelidade,
  MovimentoFidelidade
} = require("../../models");

const AppError = require("../../utils/AppError");
const auditoriaService = require("../auditoria/auditoria.service");

async function consultarFidelidade(clienteId) {
  const cliente = await Cliente.findByPk(clienteId);

  if (!cliente) {
    throw new AppError({
      error: "CLIENTE_NAO_ENCONTRADO",
      message: "Cliente não encontrado.",
      statusCode: 404
    });
  }

  const [conta] = await ContaFidelidade.findOrCreate({
    where: { clienteId },
    defaults: {
      clienteId,
      saldoPontos: 0
    }
  });

  const movimentos = await MovimentoFidelidade.findAll({
    where: {
      contaFidelidadeId: conta.id
    },
    order: [["id", "DESC"]],
    limit: 50
  });

  return {
    cliente: {
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      consentimentoLgpd: cliente.consentimentoLgpd
    },
    saldoPontos: conta.saldoPontos,
    movimentos
  };
}

async function resgatarPontos(clienteId, dados, contexto) {
  const { pontos, descricao } = dados;

  if (!pontos) {
    throw new AppError({
      error: "PONTOS_OBRIGATORIOS",
      message: "A quantidade de pontos é obrigatória.",
      statusCode: 400
    });
  }

  if (!Number.isInteger(Number(pontos)) || Number(pontos) <= 0) {
    throw new AppError({
      error: "PONTOS_INVALIDOS",
      message: "A quantidade de pontos deve ser um número inteiro maior que zero.",
      statusCode: 422
    });
  }

  const resultado = await sequelize.transaction(async (transaction) => {
    const cliente = await Cliente.findByPk(clienteId, { transaction });

    if (!cliente) {
      throw new AppError({
        error: "CLIENTE_NAO_ENCONTRADO",
        message: "Cliente não encontrado.",
        statusCode: 404
      });
    }

    const [conta] = await ContaFidelidade.findOrCreate({
      where: { clienteId },
      defaults: {
        clienteId,
        saldoPontos: 0
      },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    const saldoAtual = Number(conta.saldoPontos);
    const pontosResgate = Number(pontos);

    if (saldoAtual < pontosResgate) {
      throw new AppError({
        error: "SALDO_FIDELIDADE_INSUFICIENTE",
        message: "Saldo de pontos insuficiente para resgate.",
        statusCode: 409,
        details: [
          {
            field: "pontos",
            issue: `Saldo atual: ${saldoAtual}`
          }
        ]
      });
    }

    const novoSaldo = saldoAtual - pontosResgate;

    await conta.update(
      {
        saldoPontos: novoSaldo
      },
      { transaction }
    );

    const movimento = await MovimentoFidelidade.create(
      {
        contaFidelidadeId: conta.id,
        pedidoId: null,
        tipo: "RESGATE",
        pontos: pontosResgate,
        descricao: descricao || `Resgate de ${pontosResgate} pontos.`
      },
      { transaction }
    );

    await auditoriaService.registrarAuditoria({
      usuarioId: contexto.usuarioId,
      acao: "RESGATAR_PONTOS_FIDELIDADE",
      entidade: "Cliente",
      entidadeId: cliente.id,
      detalhes: {
        clienteId: cliente.id,
        pontosResgatados: pontosResgate,
        saldoAnterior: saldoAtual,
        novoSaldo
      },
      ip: contexto.ip,
      userAgent: contexto.userAgent,
      transaction
    });

    return {
      message: "Resgate de pontos realizado com sucesso.",
      saldoAnterior: saldoAtual,
      pontosResgatados: pontosResgate,
      novoSaldo,
      movimento
    };
  });

  return resultado;
}

module.exports = {
  consultarFidelidade,
  resgatarPontos
};