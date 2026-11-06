describe('Portal de Prêmios e Recompensas - E2E Cypress', () => {
  const login = () => {
    cy.get('input#username').clear().type('admin');
    cy.get('input#password').clear().type('admin');
    cy.get('button[type="submit"]').click();
    cy.contains('Portal de Prêmios').should('be.visible');
  };

  beforeEach(() => {
    cy.visit('/');
  });

  it('1. Deve renderizar a tela de login e efetuar login como admin, validando saldo inicial', () => {
    cy.contains('Acesso ao Portal').should('be.visible');
    login();

    // Valida que o saldo exibido é exatamente o valor do seeding (1.500 pts)
    cy.contains('Saldo:').should('be.visible');
    cy.contains('Saldo:')
      .parent()
      .invoke('text')
      .then((text) => {
        // O saldo inicial do admin seed é 1500 pts
        expect(text).to.include('1.500');
      });

    cy.contains('Administrador do Sistema').should('be.visible');
  });

  it('2. Deve cadastrar novo usuário e confirmar notificação de sucesso', () => {
    login();

    cy.contains('button', 'Novo Usuário').click();
    cy.contains('Cadastrar Novo Usuário').should('be.visible');

    const randomUser = `user_${Date.now()}`;
    cy.get('input[placeholder="Ex: Beatriz Lima"]').type('Usuário Cypress E2E');
    cy.get('input[placeholder="Ex: beatriz.lima"]').type(randomUser);
    cy.get('input[placeholder="beatriz@empresa.com"]').type(`${randomUser}@teste.com`);
    cy.get('input[placeholder="Senha de acesso"]').type('senha123');

    cy.contains('button', 'Cadastrar').click();

    cy.contains('Cadastrar Novo Usuário').should('not.exist');
    cy.contains('sucesso', { matchCase: false }).should('be.visible');
  });

  it('3. Deve cadastrar produto com custo 250 pts e validar que o valor aparece no catálogo', () => {
    login();

    cy.contains('button', 'Catálogo de Prêmios').click();
    cy.contains('button', 'Novo Prêmio').click();
    cy.contains('Cadastrar Novo Prêmio').should('be.visible');

    const prodTitle = `Produto Teste E2E ${Date.now()}`;
    cy.get('input[placeholder="Ex: Smartwatch Fitness Tracker"]').type(prodTitle);
    cy.get('textarea[placeholder="Detalhes, especificações e diferenciais do item"]').type('Item cadastrado para validação E2E');

    // Define custo de 250 pontos e estoque de 5
    cy.get('input[type="number"]').first().clear().type('250');

    cy.contains('button', 'Salvar Prêmio').click();

    cy.contains('Cadastrar Novo Prêmio').should('not.exist');

    // Valida que o produto aparece no catálogo com o título correto
    cy.contains(prodTitle).should('be.visible');

    // Valida que o custo de 250 pts é exibido no card do produto recém-cadastrado
    cy.contains('div.glass-card', prodTitle).within(() => {
      cy.contains('250').should('be.visible');
    });
  });

  it('4. Deve distribuir 50 pontos ao admin e validar valor exato no extrato', () => {
    login();

    // Captura o saldo atual antes da distribuição
    let balanceBefore: number;
    cy.contains('Saldo:')
      .parent()
      .invoke('text')
      .then((text) => {
        // Extrai o número do texto "Saldo: 1.500 pts"
        const match = text.replace(/\./g, '').match(/\d+/);
        balanceBefore = match ? parseInt(match[0]) : 0;
      });

    // Abre o modal de gestão de pontos
    cy.contains('button', 'Gerenciar Pontos').click();
    cy.contains('Gestão de Pontos').should('be.visible');

    // Garante que estamos na aba "Distribuir para Usuário"
    cy.contains('button', 'Distribuir para Usuário').click();

    // Define exatamente 50 pontos
    cy.get('input[type="number"]').clear().type('50');
    cy.get('input[placeholder="Ex: Entrega impecável no trimestre"]').clear().type('Bônus Cypress E2E');

    cy.contains('button', 'Distribuir Pontos').click();

    // Modal deve fechar e toast de sucesso deve aparecer
    cy.contains('Gestão de Pontos').should('not.exist');
    cy.contains('sucesso', { matchCase: false }).should('be.visible');

    // Aguarda dados serem recarregados e vai para o extrato
    cy.contains('button', 'Extrato de Pontos').click();

    // Valida que a transação com descrição correta aparece no extrato
    cy.contains('Bônus Cypress E2E').should('be.visible');

    // Valida que o valor de 50 pts aparece na linha da transação de distribuição
    cy.contains('tr', 'Bônus Cypress E2E').within(() => {
      cy.contains('50').should('be.visible');
    });
  });

  it('5. Deve resgatar produto de 10 pts e validar débito exato no saldo e registro no extrato', () => {
    login();

    // Captura o saldo antes do resgate
    let balanceBefore: number;
    cy.contains('Saldo:')
      .parent()
      .invoke('text')
      .then((text) => {
        const match = text.replace(/\./g, '').match(/\d+/);
        balanceBefore = match ? parseInt(match[0]) : 0;
      });

    // Vai para catálogo e cria produto de 10 pts
    cy.contains('button', 'Catálogo de Prêmios').click();
    cy.contains('button', 'Novo Prêmio').click();

    const rescueItem = `Voucher Expresso ${Date.now()}`;
    cy.get('input[placeholder="Ex: Smartwatch Fitness Tracker"]').type(rescueItem);
    cy.get('textarea[placeholder="Detalhes, especificações e diferenciais do item"]').type('Voucher rápido para resgate');
    cy.get('input[type="number"]').first().clear().type('10');
    cy.contains('button', 'Salvar Prêmio').click();

    // Resgata o produto recém-criado
    cy.contains('div.glass-card', rescueItem).within(() => {
      cy.contains('button', 'Resgatar Prêmio').click();
    });

    // Toast de sucesso deve aparecer
    cy.contains('Prêmio resgatado com sucesso', { matchCase: false }).should('be.visible');

    // Valida que o saldo diminuiu exatamente 10 pts
    cy.contains('Saldo:')
      .parent()
      .invoke('text')
      .then((text) => {
        const match = text.replace(/\./g, '').match(/\d+/);
        const balanceAfter = match ? parseInt(match[0]) : 0;
        expect(balanceAfter).to.equal(balanceBefore - 10);
      });

    // Vai para o extrato e valida que o resgate foi registrado
    cy.contains('button', 'Extrato de Pontos').click();

    // Valida que a transação de resgate aparece com o nome exato do item
    cy.contains(`Resgate de prêmio: ${rescueItem}`).should('be.visible');

    // Valida que o valor 10 aparece na linha da transação de resgate
    cy.contains('tr', rescueItem).within(() => {
      cy.contains('10').should('be.visible');
    });
  });

  it('6. Deve alternar entre tema claro e escuro e validar mudança via atributo data-theme', () => {
    login();

    // Verifica que o tema inicial é escuro (padrão)
    cy.get('html').should('have.attr', 'data-theme', 'dark');

    // Clica no botão de toggle de tema
    cy.get('[data-cy="theme-toggle"]').click();

    // Verifica que o tema mudou para claro
    cy.get('html').should('have.attr', 'data-theme', 'light');

    // Clica novamente para voltar ao escuro
    cy.get('[data-cy="theme-toggle"]').click();

    // Verifica que voltou ao tema escuro
    cy.get('html').should('have.attr', 'data-theme', 'dark');
  });
});
