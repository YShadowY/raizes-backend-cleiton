"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface) {
    const senhaHashAdmin = await bcrypt.hash("Admin@123", 10);
    const senhaHashCliente = await bcrypt.hash("Cliente@123", 10);

    await queryInterface.sequelize.query(`
      INSERT INTO usuarios (nome, email, senha_hash, role, ativo, created_at, updated_at)
      VALUES
        ('Admin Raizes', 'admin@raizes.com', '${senhaHashAdmin}', 'ADMIN', true, NOW(), NOW()),
        ('Cliente Teste', 'cliente@raizes.com', '${senhaHashCliente}', 'CLIENTE', true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING;
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO clientes (usuario_id, nome, email, telefone, consentimento_lgpd, data_consentimento, created_at, updated_at)
      SELECT u.id, 'Cliente Teste', 'cliente@raizes.com', '77999990000', true, NOW(), NOW(), NOW()
      FROM usuarios u
      WHERE u.email = 'cliente@raizes.com'
      ON CONFLICT (email) DO NOTHING;
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO contas_fidelidade (cliente_id, saldo_pontos, created_at, updated_at)
      SELECT c.id, 0, NOW(), NOW()
      FROM clientes c
      WHERE c.email = 'cliente@raizes.com'
      ON CONFLICT (cliente_id) DO NOTHING;
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO unidades (nome, cidade, estado, endereco, ativa, created_at, updated_at)
      VALUES
        ('Raízes do Nordeste - Centro', 'Vitória da Conquista', 'BA', 'Av. Principal, 1000 - Centro', true, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO produtos (nome, descricao, categoria, preco_base, ativo, created_at, updated_at)
      VALUES
        ('Tapioca Tradicional', 'Tapioca com manteiga de garrafa e queijo coalho.', 'TAPIOCAS', 12.90, true, NOW(), NOW()),
        ('Baião de Dois', 'Arroz, feijão verde, queijo coalho e carne de sol.', 'PRATOS_REGIONAIS', 29.90, true, NOW(), NOW()),
        ('Cuscuz Nordestino', 'Cuscuz de milho com ovo e queijo coalho.', 'CUSCUZ', 15.90, true, NOW(), NOW()),
        ('Suco de Cajá', 'Suco natural de cajá.', 'BEBIDAS', 8.90, true, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO estoques (unidade_id, produto_id, quantidade, estoque_minimo, created_at, updated_at)
      SELECT u.id, p.id, 50, 5, NOW(), NOW()
      FROM unidades u
      CROSS JOIN produtos p
      WHERE u.nome = 'Raízes do Nordeste - Centro'
      ON CONFLICT (unidade_id, produto_id) DO NOTHING;
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO promocoes (nome, descricao, percentual_desconto, ativa, data_inicio, data_fim, created_at, updated_at)
      VALUES
        ('Festival Junino', 'Promoção sazonal para produtos regionais selecionados.', 10.00, true, NOW(), NOW() + INTERVAL '30 days', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DELETE FROM promocoes WHERE nome = 'Festival Junino';
      DELETE FROM estoques;
      DELETE FROM produtos WHERE nome IN ('Tapioca Tradicional', 'Baião de Dois', 'Cuscuz Nordestino', 'Suco de Cajá');
      DELETE FROM unidades WHERE nome = 'Raízes do Nordeste - Centro';
      DELETE FROM contas_fidelidade WHERE cliente_id IN (SELECT id FROM clientes WHERE email = 'cliente@raizes.com');
      DELETE FROM clientes WHERE email = 'cliente@raizes.com';
      DELETE FROM usuarios WHERE email = 'cliente@raizes.com';
    `);
  }
};