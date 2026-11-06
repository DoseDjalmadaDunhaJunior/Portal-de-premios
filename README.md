# 🏆 Portal de Prêmios e Recompensas (Estudo & Arquitetura Limpa)

Projeto prático para fins acadêmicos e estudo arquitetural, combinando **ASP.NET Core Web API (.NET 10)** e **React com TypeScript (Vite)** com interface moderna em **Design Dark Glassmorphism**, persistência orientada a arquivos JSON, suíte rigorosa de **TDD (Test-Driven Development)**, testes ponta a ponta (**Cypress E2E**) e estrutura extensível para Controle de Acesso Baseado em Nível (**RBAC**).

---

## 👥 Colaboração dos Agentes Especializados

- **Agente A (QA / Tester):**
  - Conduziu o fluxo estrito de TDD (Red-Green-Refactor).
  - Implementou e validou a suíte de testes unitários do backend com `xUnit`, `Moq` e `FluentAssertions` (**17 testes aprovados**, incluindo regras de negócio para resgate de prêmios, estoque e saldo).
  - Implementou e validou a suíte de testes unitários de componentes do frontend com `Vitest` e `@testing-library/react` (**8 testes aprovados**, incluindo botão de resgate e esgotamento de estoque).
  - Implementou a suíte de testes ponta a ponta (E2E) com **Cypress** (**5 cenários completos aprovados**, incluindo o fluxo real de resgate e atualização de saldo).
- **Agente B (Tech Writer / Doc):**
  - Elaborou o guia de arquitetura, documentação dos testes executados e este `README.md`.
- **Agente C (Backend Dev):**
  - Estruturou o backend em Clean Architecture / MVC (`Domain`, `Repositories`, `Services`, `Controllers`).
  - Implementou o endpoint transacional `POST /api/products/redeem`, garantindo validação de estoque, débito de pontos do usuário e geração de movimentação de resgate com timestamp no extrato.
  - Implementou a persistência leve via repositórios genéricos assíncronos e thread-safe com arquivos JSON (`IJsonRepository<T>`).
  - Implementou o *Seeding* automático inicial com produtos, campanhas, postagens e credenciais padrão (`admin`/`admin`).
- **Agente D (Frontend Dev):**
  - Implementou a funcionalidade interativa de **Resgate de Prêmios** diretamente nos cards do catálogo, com botão dinâmico para itens acessíveis, tratamento de itens esgotados, débito em tempo real no saldo do usuário e geração de extrato.
  - Aplicou padrão visual contemporâneo (Dark Glassmorphism, efeitos de profundidade, glow gradients, feedback visual via toasts e modais com validações e sincronização reativa).

---

## 📂 Estrutura de Pastas da Solução

```text
PortalEstudo/
├── .gitignore                          # Configurado para .NET, Node, Vite, JSONs locais e IDEs
├── PortalPremios.sln                   # Arquivo de solução Visual Studio
├── README.md                           # Documentação completa
├── src/
│   ├── backend/
│   │   └── PortalPremios.Api/          # ASP.NET Core Web API (.NET 10 + SpaProxy)
│   │       ├── Contracts/              # DTOs e Records (RedeemProductRequest, etc.)
│   │       ├── Controllers/            # Auth, Users, Products (com /redeem), Points, SocialFeed
│   │       ├── Data/                   # DataSeeder e Storage JSON
│   │       │   └── Storage/            # users.json, products.json, campaigns.json, etc.
│   │       ├── Domain/                 # Entidades de Domínio e Enums (TransactionType.Redemption)
│   │       ├── Repositories/           # IJsonRepository<T> e implementação JsonRepository<T>
│   │       ├── Services/               # UserService, ProductService (com resgate), PointsService
│   │       └── Program.cs              # Injeção de dependências, CORS e Inicialização
│   └── frontend/                       # React 19 com TypeScript & Vite (Dark Glassmorphism)
│       ├── cypress/
│       │   └── e2e/                    # Testes E2E com Cypress (portal.cy.ts)
│       ├── src/
│       │   ├── components/             # LoginForm, ProductCard (com resgate), PostCard, StatementView, Modais
│       │   ├── services/               # api.ts (comunicação REST com redeemProduct)
│       │   ├── test/                   # Testes unitários com Vitest e React Testing Library
│       │   ├── types/                  # Contratos e tipos TypeScript (User, Product, Campaign...)
│       │   ├── App.tsx                 # Dashboard principal moderno
│       │   └── main.tsx
│       ├── cypress.config.ts           # Configuração do Cypress E2E
│       ├── package.json
│       ├── vite.config.ts
│       └── tsconfig.json
└── tests/
    └── backend/
        └── PortalPremios.Tests/        # Projeto xUnit com FluentAssertions e Moq
            ├── Services/               # ProductServiceTests (com testes de resgate), UserServiceTests, etc.
            └── PortalPremios.Tests.csproj
```

---

## 🧪 Resumo dos Testes e Validação (100% Sucesso)

### 🔹 1. Testes Ponta a Ponta com Cypress E2E (5/5 Aprovados)
Localizados em `src/frontend/cypress/e2e/portal.cy.ts`:
1. **Login & Autenticação:** Acessa com `admin`/`admin` e valida renderização do dashboard, nome do usuário e saldo de pontos.
2. **Cadastro de Usuário:** Abre modal, cadastra um novo usuário e valida o fechamento e notificação de sucesso.
3. **Cadastro de Prêmio no Catálogo:** Abre modal de produto, insere detalhes/pontuação e valida a renderização imediata do card no catálogo.
4. **Gestão & Distribuição de Pontos:** Transfere pontos da campanha para um usuário e valida o registro refletido no Extrato de Pontos com timestamp.
5. **Resgate de Produto no Catálogo:** Localiza o item, clica em "Resgatar Prêmio", valida o débito de pontos no saldo do usuário e a gravação da transação de resgate no Extrato.

### 🔹 2. Backend (17 Testes Unitários - xUnit / Moq / FluentAssertions)
1. **ProductServiceTests (6 testes):**
   - Listagem de produtos.
   - Criação com dados válidos e rejeição com custo inválido.
   - Resgate com sucesso (deduz saldo do usuário, diminui estoque do produto e gera `PointTransaction` do tipo `Redemption`).
   - Bloqueio de resgate se saldo insuficiente.
   - Bloqueio de resgate se produto esgotado (estoque 0).
2. **UserServiceTests (4 testes):** Autenticação válida/inválida, criação de usuário e validação de duplicidade.
3. **PointsServiceTests (5 testes):** Aporte em campanha, distribuição debitando campanha e creditando usuário, rejeição por saldo insuficiente e ordenação decrescente de extratos.
4. **SocialPostServiceTests (2 testes):** Publicação de posts vinculada ao autor e ação de curtidas.

### 🔹 3. Frontend (8 Testes Unitários - Vitest / RTL)
1. **LoginForm.test.tsx:** Renderização de formulário e autenticação.
2. **ProductCard.test.tsx:** Renderização de prêmio, validação do botão de resgate com callback, indicação de pontos faltantes e mensagem de esgotado.
3. **PostCard.test.tsx:** Renderização de postagem, anexos e curtidas.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [.NET SDK 10+](https://dotnet.microsoft.com/)
- [Node.js 18+](https://nodejs.org/)

---

### Execução no Visual Studio (1 Clique no Iniciar)
1. Abra a solução **`PortalPremios.sln`** no Visual Studio.
2. Certifique-se de que o projeto de inicialização está como **`PortalPremios.Api`**.
3. Clique no botão **Iniciar / Run (F5)** na barra superior:
   - A API backend (.NET) inicializará na porta `5000`.
   - O frontend Vite (`npm run dev`) será disparado automaticamente via `SpaProxy` na porta `3000`.
   - O navegador abrirá diretamente pronto para uso.

---

### Execução via Linha de Comando (CLI / VS Code)

#### 1. Iniciar o Backend:
```bash
# Na raiz do projeto
cd src/backend/PortalPremios.Api
dotnet run
```
> O backend estará acessível em: `http://localhost:5000`

#### 2. Iniciar o Frontend:
```bash
# Em outro terminal, na raiz do projeto
cd src/frontend
npm install
npm run dev
```
> O frontend estará acessível em: `http://localhost:3000`

---

## ⚙️ Como Rodar os Testes

### Testes End-to-End (Cypress):
Com o backend e frontend rodando:
```bash
cd src/frontend
# Modo headless (terminal):
npm run cypress:run

# Modo interativo (interface gráfica do Cypress):
npm run cypress:open
```

### Testes Unitários do Frontend (Vitest):
```bash
cd src/frontend
npm run test
```

### Testes Unitários do Backend (xUnit):
```bash
dotnet test PortalPremios.sln
```

---

## 🔑 Credenciais Padrão & Seeding Inicial

O sistema inicializa automaticamente os arquivos JSON com dados de teste para estudo:
- **Usuário Padrão:** `admin`
- **Senha Padrão:** `admin`
- **Perfil:** `Admin` (preparado com Enum `UserRole: User = 1, Manager = 2, Admin = 3`)
- **Saldo Inicial do Admin:** `1.500 pts`
- **Campanha Padrão:** `Reconhecimento & Inovação 2026` com fundo de pontos inicial disponível.