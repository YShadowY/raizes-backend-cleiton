const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Raízes do Nordeste",
      version: "1.0.0",
      description:
        "API Back-End para sistema de pedidos multicanal da Rede Raízes do Nordeste. Projeto desenvolvido por Cleiton Maciel dos Santos - RU 4714366."
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Servidor local"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        ErroPadrao: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "ESTOQUE_INSUFICIENTE"
            },
            message: {
              type: "string",
              example: "Estoque insuficiente para o produto informado."
            },
            details: {
              type: "array",
              items: {
                type: "object"
              }
            },
            timestamp: {
              type: "string",
              example: "2026-06-27T01:00:00.000Z"
            },
            path: {
              type: "string",
              example: "/api/pedidos"
            }
          }
        }
      }
    },
    tags: [
      { name: "Health", description: "Verificação da API" },
      { name: "Auth", description: "Autenticação e registro de usuários" },
      { name: "Usuários", description: "Dados do usuário autenticado" },
      { name: "Unidades", description: "Gestão e consulta de unidades" },
      { name: "Produtos", description: "Gestão e consulta de produtos" },
      { name: "Estoque", description: "Consulta e movimentação de estoque" },
      { name: "Pedidos", description: "Fluxo de criação e gestão de pedidos" },
      { name: "Pagamentos", description: "Pagamento mock" },
      { name: "Fidelidade", description: "Programa de pontos" },
      { name: "Auditoria", description: "Logs de ações sensíveis" }
    ],
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Verifica se a API está ativa",
          responses: {
            200: {
              description: "API ativa"
            }
          }
        }
      },

      "/auth/registro": {
        post: {
          tags: ["Auth"],
          summary: "Registra um novo usuário",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                example: {
                  nome: "Cliente Teste",
                  email: "cliente2@raizes.com",
                  senha: "Cliente@123",
                  role: "CLIENTE",
                  telefone: "77999990000",
                  consentimentoLgpd: true
                }
              }
            }
          },
          responses: {
            201: {
              description: "Usuário cadastrado com sucesso"
            },
            400: {
              description: "Campos obrigatórios ausentes"
            },
            409: {
              description: "E-mail já cadastrado"
            },
            422: {
              description: "Role inválida"
            }
          }
        }
      },

      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Autentica usuário e retorna token JWT",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                example: {
                  email: "admin@raizes.com",
                  senha: "Admin@123"
                }
              }
            }
          },
          responses: {
            200: {
              description: "Login realizado com sucesso"
            },
            400: {
              description: "E-mail e senha obrigatórios"
            },
            401: {
              description: "Credenciais inválidas"
            }
          }
        }
      },

      "/usuarios/me": {
        get: {
          tags: ["Usuários"],
          summary: "Retorna dados do usuário autenticado",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Dados do usuário autenticado"
            },
            401: {
              description: "Token ausente ou inválido"
            }
          }
        }
      },

      "/unidades": {
        get: {
          tags: ["Unidades"],
          summary: "Lista unidades da rede",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Lista de unidades"
            },
            401: {
              description: "Não autenticado"
            }
          }
        },
        post: {
          tags: ["Unidades"],
          summary: "Cria nova unidade",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                example: {
                  nome: "Raízes do Nordeste - Shopping",
                  cidade: "Salvador",
                  estado: "BA",
                  endereco: "Av. Exemplo, 500"
                }
              }
            }
          },
          responses: {
            201: {
              description: "Unidade criada"
            },
            403: {
              description: "Sem permissão"
            }
          }
        }
      },

      "/unidades/{unidadeId}/cardapio": {
        get: {
          tags: ["Unidades"],
          summary: "Consulta cardápio disponível por unidade",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "unidadeId",
              in: "path",
              required: true,
              schema: { type: "integer" },
              example: 1
            }
          ],
          responses: {
            200: {
              description: "Cardápio da unidade"
            },
            404: {
              description: "Unidade não encontrada"
            }
          }
        }
      },

      "/produtos": {
        get: {
          tags: ["Produtos"],
          summary: "Lista produtos",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Lista de produtos"
            }
          }
        },
        post: {
          tags: ["Produtos"],
          summary: "Cria produto",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                example: {
                  nome: "Bolo de Macaxeira",
                  descricao: "Bolo regional de macaxeira.",
                  categoria: "SOBREMESAS",
                  precoBase: 9.9
                }
              }
            }
          },
          responses: {
            201: {
              description: "Produto criado"
            },
            403: {
              description: "Sem permissão"
            },
            422: {
              description: "Preço inválido"
            }
          }
        }
      },

      "/unidades/{unidadeId}/estoque": {
        get: {
          tags: ["Estoque"],
          summary: "Consulta estoque de uma unidade",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "unidadeId",
              in: "path",
              required: true,
              schema: { type: "integer" },
              example: 1
            }
          ],
          responses: {
            200: {
              description: "Estoque da unidade"
            },
            403: {
              description: "Sem permissão"
            }
          }
        }
      },

      "/estoque/movimentacoes": {
        post: {
          tags: ["Estoque"],
          summary: "Realiza entrada ou saída manual de estoque",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                example: {
                  unidadeId: 1,
                  produtoId: 1,
                  tipo: "ENTRADA",
                  quantidade: 10
                }
              }
            }
          },
          responses: {
            200: {
              description: "Movimentação realizada"
            },
            409: {
              description: "Estoque insuficiente"
            }
          }
        }
      },

      "/pedidos": {
        post: {
          tags: ["Pedidos"],
          summary: "Cria pedido validando canalPedido e estoque",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                example: {
                  clienteId: 1,
                  unidadeId: 1,
                  canalPedido: "APP",
                  formaPagamento: "MOCK",
                  itens: [
                    {
                      produtoId: 1,
                      quantidade: 2
                    },
                    {
                      produtoId: 4,
                      quantidade: 1
                    }
                  ],
                  observacao: "Pedido de teste"
                }
              }
            }
          },
          responses: {
            201: {
              description: "Pedido criado"
            },
            400: {
              description: "Campos obrigatórios ausentes"
            },
            404: {
              description: "Cliente, unidade ou produto não encontrado"
            },
            409: {
              description: "Estoque insuficiente"
            },
            422: {
              description: "Canal, forma de pagamento ou quantidade inválida"
            }
          }
        },
        get: {
          tags: ["Pedidos"],
          summary: "Lista pedidos com filtros opcionais",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "canalPedido",
              in: "query",
              required: false,
              schema: {
                type: "string",
                enum: ["APP", "TOTEM", "BALCAO", "PICKUP", "WEB"]
              }
            },
            {
              name: "status",
              in: "query",
              required: false,
              schema: {
                type: "string",
                enum: [
                  "AGUARDANDO_PAGAMENTO",
                  "PAGO",
                  "EM_PREPARO",
                  "PRONTO",
                  "ENTREGUE",
                  "CANCELADO",
                  "PAGAMENTO_RECUSADO"
                ]
              }
            }
          ],
          responses: {
            200: {
              description: "Lista de pedidos"
            }
          }
        }
      },

      "/pedidos/{id}": {
        get: {
          tags: ["Pedidos"],
          summary: "Busca pedido por ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              example: 1
            }
          ],
          responses: {
            200: {
              description: "Pedido encontrado"
            },
            404: {
              description: "Pedido não encontrado"
            }
          }
        }
      },

      "/pedidos/{id}/status": {
        patch: {
          tags: ["Pedidos"],
          summary: "Atualiza status operacional do pedido",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              example: 1
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                example: {
                  status: "EM_PREPARO"
                }
              }
            }
          },
          responses: {
            200: {
              description: "Status atualizado"
            },
            403: {
              description: "Sem permissão"
            },
            404: {
              description: "Pedido não encontrado"
            }
          }
        }
      },

      "/pedidos/{id}/cancelar": {
        patch: {
          tags: ["Pedidos"],
          summary: "Cancela pedido",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              example: 1
            }
          ],
          responses: {
            200: {
              description: "Pedido cancelado"
            },
            409: {
              description: "Cancelamento inválido"
            }
          }
        }
      },

      "/pagamentos/mock/{pedidoId}": {
        post: {
          tags: ["Pagamentos"],
          summary: "Processa pagamento mock do pedido",
          description:
            "Aprova pagamentos com total menor ou igual a R$ 1.000,00 e recusa valores acima deste limite.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "pedidoId",
              in: "path",
              required: true,
              schema: { type: "integer" },
              example: 1
            }
          ],
          responses: {
            200: {
              description: "Pagamento processado"
            },
            404: {
              description: "Pedido ou pagamento não encontrado"
            },
            409: {
              description: "Pedido não está aguardando pagamento"
            }
          }
        }
      },

      "/clientes/{clienteId}/fidelidade": {
        get: {
          tags: ["Fidelidade"],
          summary: "Consulta saldo e histórico de fidelidade do cliente",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "clienteId",
              in: "path",
              required: true,
              schema: { type: "integer" },
              example: 1
            }
          ],
          responses: {
            200: {
              description: "Dados de fidelidade"
            },
            404: {
              description: "Cliente não encontrado"
            }
          }
        }
      },

      "/clientes/{clienteId}/fidelidade/resgatar": {
        post: {
          tags: ["Fidelidade"],
          summary: "Resgata pontos de fidelidade",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "clienteId",
              in: "path",
              required: true,
              schema: { type: "integer" },
              example: 1
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                example: {
                  pontos: 10,
                  descricao: "Resgate para desconto em pedido futuro"
                }
              }
            }
          },
          responses: {
            200: {
              description: "Resgate realizado"
            },
            409: {
              description: "Saldo insuficiente"
            }
          }
        }
      },

      "/auditoria": {
        get: {
          tags: ["Auditoria"],
          summary: "Lista logs de auditoria",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Lista de logs"
            },
            403: {
              description: "Sem permissão"
            }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;