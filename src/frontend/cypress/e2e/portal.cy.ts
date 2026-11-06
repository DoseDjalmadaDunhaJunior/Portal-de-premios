describe('Portal de Prêmios e Recompensas - E2E Cypress', () => {
  beforeEach(() => {
    // Acessa a raiz da aplicação
    cy.visit('/');
  });

  it('1. Deve renderizar a tela de login com credenciais predefinidas e efetuar login como admin', () => {
    cy.contains('Acesso ao Portal').should('be.visible');
    cy.get('input#username').clear().type('admin');
    cy.get('input#password').clear().type('admin');
    cy.get('button[type="submit"]').click();

    // Deve estar no dashboard
    cy.contains('Portal de Prêmios').should('be.visible');
    cy.contains('Administrador do Sistema').should('be.visible');
    cy.contains('Saldo:').should('be.visible');
  });

  it('2. Deve abrir o modal de cadastro de novo usuário e cadastrar com sucesso', () => {
    // Login
    cy.get('input#username').clear().type('admin');
    cy.get('input#password').clear().type('admin');
    cy.get('button[type="submit"]').click();

    // Clicar no botão "Novo Usuário"
    cy.contains('button', 'Novo Usuário').click();
    cy.contains('Cadastrar Novo Usuário').should('be.visible');

    const randomUser = `user_${Date.now()}`;
    cy.get('input[placeholder="Ex: Beatriz Lima"]').type('Usuário Cypress E2E');
    cy.get('input[placeholder="Ex: beatriz.lima"]').type(randomUser);
    cy.get('input[placeholder="beatriz@empresa.com"]').type(`${randomUser}@teste.com`);
    cy.get('input[placeholder="Senha de acesso"]').type('senha123');

    cy.contains('button', 'Cadastrar').click();

    // Modal deve fechar e notificação de sucesso deve aparecer
    cy.contains('Cadastrar Novo Usuário').should('not.exist');
    cy.contains('sucesso', { matchCase: false }).should('be.visible');
  });

  it('3. Deve abrir o modal de novo prêmio e cadastrar um produto no catálogo', () => {
    // Login
    cy.get('input#username').clear().type('admin');
    cy.get('input#password').clear().type('admin');
    cy.get('button[type="submit"]').click();

    // Ir para catálogo
    cy.contains('button', 'Catálogo de Prêmios').click();
    cy.contains('button', 'Novo Prêmio').click();
    cy.contains('Cadastrar Novo Prêmio').should('be.visible');

    const prodTitle = `Produto Teste E2E ${Date.now()}`;
    cy.get('input[placeholder="Ex: Smartwatch Fitness Tracker"]').type(prodTitle);
    cy.get('textarea[placeholder="Detalhes, especificações e diferenciais do item"]').type('Item cadastrado para validação E2E');
    cy.get('input[type="number"]').first().clear().type('250');
    cy.contains('button', 'Salvar Prêmio').click();

    // Deve fechar e exibir o produto cadastrado no catálogo
    cy.contains('Cadastrar Novo Prêmio').should('not.exist');
    cy.contains(prodTitle).should('be.visible');
  });

  it('4. Deve realizar distribuição e aporte de pontos', () => {
    // Login
    cy.get('input#username').clear().type('admin');
    cy.get('input#password').clear().type('admin');
    cy.get('button[type="submit"]').click();

    // Clicar em "Gerenciar Pontos"
    cy.contains('button', 'Gerenciar Pontos').click();
    cy.contains('Gestão de Pontos').should('be.visible');

    // Distribuição de pontos
    cy.get('input[type="number"]').clear().type('50');
    cy.get('input[placeholder="Ex: Entrega impecável no trimestre"]').type('Bônus Cypress E2E');
    cy.contains('button', 'Distribuir Pontos').click();

    // Modal deve fechar
    cy.contains('Gestão de Pontos').should('not.exist');

    // Verificar se no extrato aparece
    cy.contains('button', 'Extrato de Pontos').click();
    cy.contains('Bônus Cypress E2E').should('be.visible');
  });

  it('5. Deve permitir o resgate de um produto no catálogo e atualizar os pontos e extrato', () => {
    // Login
    cy.get('input#username').clear().type('admin');
    cy.get('input#password').clear().type('admin');
    cy.get('button[type="submit"]').click();

    // Ir para catálogo
    cy.contains('button', 'Catálogo de Prêmios').click();

    // Cria um item acessível caso necessário ou localiza um com botão "Resgatar Prêmio"
    cy.contains('button', 'Novo Prêmio').click();
    const rescueItem = `Voucher Expresso ${Date.now()}`;
    cy.get('input[placeholder="Ex: Smartwatch Fitness Tracker"]').type(rescueItem);
    cy.get('textarea[placeholder="Detalhes, especificações e diferenciais do item"]').type('Voucher rápido para resgate');
    cy.get('input[type="number"]').first().clear().type('10');
    cy.contains('button', 'Salvar Prêmio').click();

    // Clica no botão de resgate do item recém-criado
    cy.contains('div.glass-card', rescueItem).within(() => {
      cy.contains('button', 'Resgatar Prêmio').click();
    });

    // Mensagem de sucesso
    cy.contains('Prêmio resgatado com sucesso', { matchCase: false }).should('be.visible');

    // Verificar no extrato que a transação de resgate foi registrada
    cy.contains('button', 'Extrato de Pontos').click();
    cy.contains(`Resgate de prêmio: ${rescueItem}`).should('be.visible');
  });
});
