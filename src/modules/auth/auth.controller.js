const authService = require("./auth.service");

async function registrar(req, res) {
  const resultado = await authService.registrarUsuario(req.body);

  return res.status(201).json(resultado);
}

async function login(req, res) {
  const resultado = await authService.login(req.body);

  return res.status(200).json(resultado);
}

module.exports = {
  registrar,
  login
};