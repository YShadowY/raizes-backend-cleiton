const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  sequelize,
  Usuario,
  Cliente,
  ContaFidelidade
} = require("../../models");

const AppError = require("../../utils/AppError");

const ROLES_PERMITIDAS = ["ADMIN", "GERENTE", "ATENDENTE", "COZINHA", "CLIENTE"];

function gerarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      role: usuario.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    }
  );
}

async function registrarUsuario(dados) {
  const {
    nome,
    email,
    senha,
    role = "CLIENTE",
    telefone,
    consentimentoLgpd = false
  } = dados;

  const camposAusentes = [];

  if (!nome) camposAusentes.push("nome");
  if (!email) camposAusentes.push("email");
  if (!senha) camposAusentes.push("senha");
  if (!role) camposAusentes.push("role");

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

  if (!ROLES_PERMITIDAS.includes(role)) {
    throw new AppError({
      error: "ROLE_INVALIDA",
      message: "O perfil informado é inválido.",
      statusCode: 422,
      details: [
        {
          field: "role",
          issue: `Use um dos valores: ${ROLES_PERMITIDAS.join(", ")}`
        }
      ]
    });
  }

  const usuarioExistente = await Usuario.findOne({
    where: { email }
  });

  if (usuarioExistente) {
    throw new AppError({
      error: "EMAIL_JA_CADASTRADO",
      message: "Já existe um usuário cadastrado com este e-mail.",
      statusCode: 409
    });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const resultado = await sequelize.transaction(async (transaction) => {
    const usuario = await Usuario.create(
      {
        nome,
        email,
        senhaHash,
        role,
        ativo: true
      },
      { transaction }
    );

    let cliente = null;

    if (role === "CLIENTE") {
      cliente = await Cliente.create(
        {
          usuarioId: usuario.id,
          nome,
          email,
          telefone: telefone || null,
          consentimentoLgpd: Boolean(consentimentoLgpd),
          dataConsentimento: consentimentoLgpd ? new Date() : null
        },
        { transaction }
      );

      await ContaFidelidade.create(
        {
          clienteId: cliente.id,
          saldoPontos: 0
        },
        { transaction }
      );
    }

    return {
      usuario,
      cliente
    };
  });

  return {
    message: "Usuário cadastrado com sucesso.",
    usuario: {
      id: resultado.usuario.id,
      nome: resultado.usuario.nome,
      email: resultado.usuario.email,
      role: resultado.usuario.role
    },
    cliente: resultado.cliente
      ? {
          id: resultado.cliente.id,
          nome: resultado.cliente.nome,
          email: resultado.cliente.email,
          consentimentoLgpd: resultado.cliente.consentimentoLgpd
        }
      : null
  };
}

async function login(dados) {
  const { email, senha } = dados;

  if (!email || !senha) {
    throw new AppError({
      error: "CAMPOS_OBRIGATORIOS",
      message: "E-mail e senha são obrigatórios.",
      statusCode: 400
    });
  }

  const usuario = await Usuario.findOne({
    where: { email }
  });

  if (!usuario) {
    throw new AppError({
      error: "CREDENCIAIS_INVALIDAS",
      message: "E-mail ou senha inválidos.",
      statusCode: 401
    });
  }

  if (!usuario.ativo) {
    throw new AppError({
      error: "USUARIO_INATIVO",
      message: "Usuário inativo.",
      statusCode: 403
    });
  }

  const senhaConfere = await bcrypt.compare(senha, usuario.senhaHash);

  if (!senhaConfere) {
    throw new AppError({
      error: "CREDENCIAIS_INVALIDAS",
      message: "E-mail ou senha inválidos.",
      statusCode: 401
    });
  }

  const token = gerarToken(usuario);

  return {
    accessToken: token,
    tokenType: "Bearer",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    user: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role
    }
  };
}

module.exports = {
  registrarUsuario,
  login
};