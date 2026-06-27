const pedidosService = require("./pedidos.service");

function montarContexto(req) {
  return {
    usuarioId: req.user ? req.user.id : null,
    ip: req.ip,
    userAgent: req.headers["user-agent"] || null
  };
}

async function criar(req, res) {
  const pedido = await pedidosService.criarPedido(req.body, montarContexto(req));

  return res.status(201).json({
    message: "Pedido criado com sucesso.",
    pedido
  });
}

async function listar(req, res) {
  const pedidos = await pedidosService.listarPedidos({
    canalPedido: req.query.canalPedido,
    status: req.query.status
  });

  return res.status(200).json({
    total: pedidos.length,
    pedidos
  });
}

async function buscarPorId(req, res) {
  const pedido = await pedidosService.buscarPedidoPorId(req.params.id);

  return res.status(200).json({
    pedido
  });
}

async function atualizarStatus(req, res) {
  const pedido = await pedidosService.atualizarStatusPedido(
    req.params.id,
    req.body.status,
    montarContexto(req)
  );

  return res.status(200).json({
    message: "Status do pedido atualizado com sucesso.",
    pedido
  });
}

async function cancelar(req, res) {
  const pedido = await pedidosService.cancelarPedido(req.params.id, montarContexto(req));

  return res.status(200).json({
    message: "Pedido cancelado com sucesso.",
    pedido
  });
}

module.exports = {
  criar,
  listar,
  buscarPorId,
  atualizarStatus,
  cancelar
};