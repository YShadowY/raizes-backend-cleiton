# Sistema de Pedidos Multicanal — Rede Raízes do Nordeste

Projeto Back-End desenvolvido para a Atividade Prática de Projeto Multidisciplinar — Trilha Back-End.

**Aluno:** Cleiton Maciel dos Santos
**RU:** 4714366
**Curso:** Análise e Desenvolvimento de Sistemas
**Instituição:** UNINTER
**Ano:** 2026

## 1. Visão geral

Esta API implementa um sistema de pedidos multicanal para a rede fictícia de lanchonetes regionais **Raízes do Nordeste**.

O sistema permite autenticação de usuários, controle de perfis, consulta de unidades e produtos, controle de estoque por unidade, criação de pedidos com validação de estoque, processamento de pagamento mock, baixa automática de estoque, geração de pontos de fidelidade e registro de auditoria de ações sensíveis.

O fluxo principal implementado é:

```text
Pedido → Pagamento mock → Atualização de status → Baixa de estoque → Fidelidade → Auditoria
```

## 2. Tecnologias utilizadas

* Node.js
* Express
* Sequelize
* PostgreSQL
* JWT
* bcryptjs
* Swagger/OpenAPI
* Postman
* Nodemon

## 3. Requisitos de ambiente

Antes de executar o projeto, é necessário ter instalado:

* Node.js 18 ou superior
* PostgreSQL 16 ou superior
* npm
* Postman, para executar a coleção de testes

## 4. Instalação

Clone o repositório:

```bash
git clone URL_DO_REPOSITORIO
cd raizes-backend-cleiton
```

Instale as dependências:

```bash
npm install
```

## 5. Configuração do ambiente

Crie um arquivo `.env` na raiz do projeto com base no exemplo abaixo:

```env
NODE_ENV=development
PORT=3000

DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=raizes_backend_cleiton
DB_USER=postgres
DB_PASSWORD=sua_senha_do_postgres

JWT_SECRET=raizes_nordeste_cleiton_4714366_secret
JWT_EXPIRES_IN=1d
```

Também há um arquivo `.env.example` com a estrutura esperada das variáveis.

Importante: o arquivo `.env` não deve ser enviado ao GitHub, pois contém dados sensíveis de configuração local.

## 6. Banco de dados

Crie o banco de dados no PostgreSQL:

```sql
CREATE DATABASE raizes_backend_cleiton;
```

Ou pelo terminal, se o PostgreSQL estiver no PATH:

```bash
createdb -U postgres raizes_backend_cleiton
```

Caso esteja no Windows e usando PostgreSQL instalado em `C:\Program Files\PostgreSQL\18\bin`, pode usar:

```bat
"C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres -h localhost -p 5432 raizes_backend_cleiton
```

## 7. Executar migrations

Depois de configurar o `.env` e criar o banco, execute:

```bash
npm run db:migrate
```

Esse comando cria as tabelas principais do sistema:

* usuarios
* clientes
* unidades
* produtos
* estoques
* pedidos
* itens_pedido
* pagamentos
* contas_fidelidade
* movimentos_fidelidade
* promocoes
* auditoria_logs

## 8. Executar seed inicial

Para popular o banco com dados mínimos de teste:

```bash
npm run db:seed
```

O seed cria:

* usuário administrador;
* usuário cliente;
* cliente vinculado;
* conta de fidelidade;
* unidade inicial;
* produtos regionais;
* estoque inicial;
* promoção de exemplo.

Credenciais criadas pelo seed:

```text
Admin:
email: admin@raizes.com
senha: Admin@123

Cliente:
email: cliente@raizes.com
senha: Cliente@123
```

## 9. Executar a API

Para iniciar em modo desenvolvimento:

```bash
npm run dev
```

A API ficará disponível em:

```text
http://localhost:3000/api
```

Health check:

```text
GET http://localhost:3000/api/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "service": "raizes-backend-cleiton",
  "aluno": "Cleiton Maciel dos Santos",
  "ru": "4714366"
}
```

## 10. Documentação Swagger/OpenAPI

A documentação interativa está disponível em:

```text
http://localhost:3000/api-docs
```

O arquivo JSON do OpenAPI está disponível em:

```text
http://localhost:3000/api-docs.json
```

Para testar endpoints protegidos no Swagger:

1. Faça login em `POST /auth/login`.
2. Copie o `accessToken`.
3. Clique em **Authorize**.
4. Informe o token no formato:

```text
Bearer SEU_TOKEN_AQUI
```

## 11. Principais endpoints

### Auth

```text
POST /api/auth/registro
POST /api/auth/login
```

### Usuários

```text
GET /api/usuarios/me
```

### Unidades

```text
GET  /api/unidades
POST /api/unidades
GET  /api/unidades/:unidadeId/cardapio
```

### Produtos

```text
GET  /api/produtos
POST /api/produtos
```

### Estoque

```text
GET  /api/unidades/:unidadeId/estoque
POST /api/estoque/movimentacoes
```

### Pedidos

```text
POST  /api/pedidos
GET   /api/pedidos
GET   /api/pedidos/:id
PATCH /api/pedidos/:id/status
PATCH /api/pedidos/:id/cancelar
```

A listagem de pedidos permite filtros:

```text
GET /api/pedidos?canalPedido=APP
GET /api/pedidos?status=PAGO
GET /api/pedidos?canalPedido=TOTEM&status=AGUARDANDO_PAGAMENTO
```

### Pagamentos

```text
POST /api/pagamentos/mock/:pedidoId
```

### Fidelidade

```text
GET  /api/clientes/:clienteId/fidelidade
POST /api/clientes/:clienteId/fidelidade/resgatar
```

### Auditoria

```text
GET /api/auditoria
```

## 12. Perfis e permissões

O sistema utiliza autenticação JWT e controle de acesso por perfil.

Perfis disponíveis:

```text
ADMIN
GERENTE
ATENDENTE
COZINHA
CLIENTE
```

Exemplos de restrição:

* `ADMIN` e `GERENTE` podem criar unidades, produtos e movimentações de estoque.
* `COZINHA` pode atualizar status operacional de pedidos.
* `CLIENTE` pode criar pedidos e consultar informações permitidas.
* Acesso sem token retorna `401 NAO_AUTENTICADO`.
* Acesso com perfil inadequado retorna `403 SEM_PERMISSAO`.

## 13. Fluxo principal do MVP

### 13.1 Criar pedido

Endpoint:

```text
POST /api/pedidos
```

Exemplo de body:

```json
{
  "clienteId": 1,
  "unidadeId": 1,
  "canalPedido": "APP",
  "formaPagamento": "MOCK",
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 2
    },
    {
      "produtoId": 4,
      "quantidade": 1
    }
  ],
  "observacao": "Pedido de teste do fluxo principal"
}
```

Regras aplicadas:

* valida cliente;
* valida unidade;
* valida produtos;
* valida estoque disponível;
* exige `canalPedido`;
* calcula total automaticamente;
* cria pagamento pendente;
* registra auditoria.

### 13.2 Processar pagamento mock

Endpoint:

```text
POST /api/pagamentos/mock/:pedidoId
```

Regra do mock:

```text
total <= 1000 → pagamento aprovado
total > 1000 → pagamento recusado
```

Se aprovado:

* pagamento vira `APROVADO`;
* pedido vira `PAGO`;
* estoque é debitado;
* pontos de fidelidade são creditados;
* auditoria é registrada.

Se recusado:

* pagamento vira `RECUSADO`;
* pedido vira `PAGAMENTO_RECUSADO`;
* estoque não é debitado;
* pontos não são gerados;
* auditoria é registrada.

## 14. Padrão de erro

Todas as respostas de erro seguem o mesmo formato:

```json
{
  "error": "NOME_DO_ERRO",
  "message": "Mensagem legível para o cliente da API.",
  "details": [],
  "timestamp": "2026-06-27T01:00:00.000Z",
  "path": "/api/rota"
}
```

Exemplos de erros implementados:

```text
NAO_AUTENTICADO
SEM_PERMISSAO
CAMPOS_OBRIGATORIOS
CREDENCIAIS_INVALIDAS
CLIENTE_NAO_ENCONTRADO
UNIDADE_NAO_ENCONTRADA
PRODUTO_NAO_ENCONTRADO
PEDIDO_NAO_ENCONTRADO
ESTOQUE_INSUFICIENTE
STATUS_INVALIDO
CANAL_PEDIDO_INVALIDO
PAGAMENTO_JA_PROCESSADO
```

## 15. Testes com Postman

A coleção Postman está disponível na pasta:

```text
postman/
```

Arquivos esperados:

```text
postman/raizes-backend-cleiton.postman_collection.json
postman/raizes-local.postman_environment.json
```

Caso os arquivos tenham sido exportados com outro nome, utilizar os arquivos `.json` presentes na pasta `postman`.

### Como executar

1. Abra o Postman.
2. Importe a collection.
3. Importe o environment `Raizes Local`.
4. Selecione o environment no canto superior direito.
5. Certifique-se de que a API está rodando em `http://localhost:3000`.
6. Execute os testes na ordem indicada.

### Variáveis do ambiente

```text
baseUrl = http://localhost:3000/api
tokenAdmin =
tokenCliente =
pedidoIdAprovado =
pedidoIdRecusado =
```

Os tokens e IDs são preenchidos automaticamente por scripts da collection.

### Cenários de teste

A collection cobre os seguintes cenários:

```text
T01 - Login admin válido
T02 - Login cliente válido
T03 - Usuário autenticado
T04 - Listar unidades
T05 - Listar produtos
T06 - Consultar cardápio por unidade
T07 - Consultar estoque da unidade
T08 - Criar pedido válido para pagamento aprovado
T09 - Processar pagamento mock aprovado
T10 - Listar pedidos
T11 - Filtrar pedidos por canal APP
T12 - Consultar fidelidade do cliente
T13 - Consultar auditoria
T14 - Acesso sem token
T15 - Login com senha errada
T16 - Pedido com produto inexistente
T17 - Pedido com estoque insuficiente
T18 - Cliente sem permissão para atualizar status
T19 - Reprocessar pagamento já aprovado
T20 - Reforçar estoque do produto 2
T21 - Criar pedido para pagamento recusado
T22 - Processar pagamento mock recusado
```

A cobertura inclui cenários positivos e negativos, validação de autenticação/autorização, regras de negócio, estoque, pagamento mock, fidelidade e auditoria.

## 16. Scripts disponíveis

```bash
npm run dev
```

Inicia a API em modo desenvolvimento com Nodemon.

```bash
npm start
```

Inicia a API em modo normal.

```bash
npm run db:migrate
```

Executa as migrations do banco.

```bash
npm run db:seed
```

Executa os seeders.

```bash
npm run db:undo
```

Desfaz a última migration.

## 17. Organização do projeto

```text
src/
├── config/
│   ├── database.js
│   ├── sequelize.js
│   └── swagger.js
├── database/
│   ├── migrations/
│   └── seeders/
├── middlewares/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   └── errorHandler.js
├── models/
│   ├── Usuario.js
│   ├── Cliente.js
│   ├── Unidade.js
│   ├── Produto.js
│   ├── Estoque.js
│   ├── Pedido.js
│   ├── ItemPedido.js
│   ├── Pagamento.js
│   ├── ContaFidelidade.js
│   ├── MovimentoFidelidade.js
│   ├── Promocao.js
│   ├── AuditoriaLog.js
│   └── index.js
├── modules/
│   ├── auth/
│   ├── unidades/
│   ├── produtos/
│   ├── estoque/
│   ├── pedidos/
│   ├── pagamentos/
│   ├── fidelidade/
│   └── auditoria/
├── utils/
├── app.js
├── routes.js
└── server.js
```

## 18. Segurança e LGPD

Controles implementados:

* autenticação JWT;
* senha com hash BCrypt;
* autorização por roles;
* não exposição de senha em responses;
* registro de consentimento LGPD no cadastro de cliente;
* minimização de dados pessoais;
* auditoria de criação de pedido, alteração de status, pagamento mock e resgate de pontos.

Os dados pessoais utilizados são limitados ao necessário para identificação do cliente e acompanhamento do pedido.

## 19. Observações finais

O projeto entrega um MVP funcional e reproduzível, com persistência real em PostgreSQL, migrations, seed inicial, autenticação JWT, controle de acesso por perfis, documentação Swagger/OpenAPI e coleção Postman com cenários de validação.

Funcionalidades futuras possíveis:

* painel administrativo web;
* promoções aplicadas automaticamente no cálculo do pedido;
* regras mais detalhadas de transição de status;
* refresh token;
* testes automatizados com Jest;
* deploy em ambiente cloud.
