# 🏆 Portal de Prêmios e Recompensas (Estudo & Arquitetura Limpa)

Projeto prático para fins acadêmicos e estudo arquitetural, combinando **ASP.NET Core Web API (.NET 10)** e **React com TypeScript (Vite)** com interface moderna em **Design Dark Glassmorphism**, suporte a **tema claro/escuro**, persistência orientada a arquivos JSON, suíte rigorosa de **TDD (Test-Driven Development)**, testes ponta a ponta (**Cypress E2E**) e estrutura extensível para Controle de Acesso Baseado em Nível (**RBAC**).

---

## 👥 Colaboração dos Agentes Especializados

- **Agente A (QA / Tester):**
  - Conduziu o fluxo estrito de TDD (Red-Green-Refactor).
  - Implementou e validou a suíte de testes unitários do backend com `xUnit`, `Moq` e `FluentAssertions` (**17 testes aprovados**, incluindo regras de negócio para resgate de prêmios, estoque e saldo).
  - Implementou e validou a suíte de testes unitários de componentes do frontend com `Vitest` e `@testing-library/react` (**8 testes aprovados**, incluindo botão de resgate e esgotamento de estoque).
  - Implementou a suíte de testes ponta a ponta (E2E) com **Cypress** (**6 cenários completos aprovados**, incluindo validação de valores exatos e toggle de tema).
- **Agente B (Tech Writer / Doc):**
  - Elaborou o guia de arquitetura, documentação dos testes executados e este `README.md`.
- **Agente C (Backend Dev):**
  - Estruturou o backend em Clean Architecture / MVC (`Domain`, `Repositories`, `Services`, `Controllers`).
  - Implementou o endpoint transacional `POST /api/products/redeem`, garantindo validação de estoque, débito de pontos do usuário e geração de movimentação de resgate com timestamp no extrato.
  - Implementou a persistência leve via repositórios genéricos assíncronos e thread-safe com arquivos JSON (`IJsonRepository<T>`).
  - Implementou o *Seeding* automático inicial com produtos, campanhas, postagens e credenciais padrão (`admin`/`admin`).
- **Agente D (Frontend Dev):**
  - Implementou a funcionalidade interativa de **Resgate de Prêmios** diretamente nos cards do catálogo.
  - Implementou o **sistema de tema claro/escuro** via `ThemeContext`, variáveis CSS e persistência em `localStorage`.
  - Aplicou padrão visual contemporâneo (Dark Glassmorphism, efeitos de profundidade, glow gradients, feedback visual via toasts e modais).

---

## 🎨 Sistema de Tema Claro / Escuro

O portal suporta alternância entre **tema escuro** (padrão — Dark Glassmorphism) e **tema claro** (Light), com as seguintes características:

### Como usar
- Clique no botão **☀️ / 🌙** localizado na barra de navegação superior (à direita do saldo de pontos).
- O tema é **persistido automaticamente** em `localStorage` e restaurado na próxima visita.

### Arquitetura da solução
| Arquivo | Responsabilidade |
|---|---|
| `src/contexts/ThemeContext.tsx` | Context API: `ThemeProvider` + hook `useTheme()` |
| `src/index.css` | Variáveis CSS em `[data-theme="dark"]` e `[data-theme="light"]` |
| `src/main.tsx` | Envolve `<App>` com `<ThemeProvider>` |
| `src/App.tsx` | Lê `theme` / `toggleTheme` via hook; renderiza botão Sun/Moon |
| `src/components/LoginForm.tsx` | Usa variável `var(--login-bg)` para o gradiente de fundo |

### Variáveis CSS principais
```css
/* Escuro */
[data-theme="dark"] {
  --bg-page:          #0b0f19;
  --bg-panel:         rgba(15, 23, 42, 0.75);
  --bg-card:          rgba(30, 41, 59, 0.6);
  --color-text:       #f1f5f9;
  --color-heading:    #ffffff;
  /* ... */
}

/* Claro */
[data-theme="light"] {
  --bg-page:          #f0f4f8;
  --bg-panel:         rgba(255, 255, 255, 0.85);
  --bg-card:          rgba(255, 255, 255, 0.75);
  --color-text:       #1e293b;
  --color-heading:    #0f172a;
  /* ... */
}
```

---

## 📂 Estrutura de Pastas da Solução

```text
PortalEstudo/
├── .gitignore
├── .gitattributes
├── PortalPremios.sln                   # Solução Visual Studio (.NET)
├── README.md
├── src/
│   ├── backend/
│   │   └── PortalPremios.Api/          # ASP.NET Core Web API (.NET 10 + SpaProxy)
│   │       ├── Contracts/
│   │       ├── Controllers/
│   │       ├── Data/
│   │       │   └── Storage/            # users.json, products.json, etc.
│   │       ├── Domain/
│   │       ├── Repositories/
│   │       ├── Services/
│   │       └── Program.cs
│   └── frontend/                       # React 19 + TypeScript + Vite
│       ├── cypress/
│       │   └── e2e/
│       │       └── portal.cy.ts        # 6 testes E2E (com validação de valores)
│       ├── src/
│       │   ├── components/
│       │   ├── contexts/
│       │   │   └── ThemeContext.tsx     # 🎨 Contexto de Tema Claro/Escuro
│       │   ├── services/
│       │   ├── test/
│       │   ├── types/
│       │   ├── App.tsx
│       │   ├── index.css               # Variáveis CSS de tema
│       │   └── main.tsx
│       ├── package.json
│       ├── vite.config.ts
│       └── tsconfig.json
└── tests/
    └── backend/
        └── PortalPremios.Tests/        # xUnit + FluentAssertions + Moq
```

---

## 🧪 Resumo dos Testes e Validação (100% Sucesso)

### 🔹 1. Testes Ponta a Ponta com Cypress E2E (6/6 Aprovados)
Localizados em `src/frontend/cypress/e2e/portal.cy.ts`:

| # | Cenário | Validação de Valor |
|---|---|---|
| 1 | **Login & Autenticação** — acessa com `admin`/`admin`, valida nome e saldo | ✅ Saldo inicial = **1.500 pts** |
| 2 | **Cadastro de Usuário** — abre modal, cadastra e valida notificação | — |
| 3 | **Cadastro de Prêmio** — cria produto com custo 250 pts | ✅ Card exibe **250 pts** |
| 4 | **Distribuição de Pontos** — distribui 50 pts ao `admin` | ✅ Extrato exibe **50 pts** na transação |
| 5 | **Resgate de Produto** — cria item de 10 pts e resgata | ✅ Saldo decrementou **exatamente 10 pts** |
| 6 | **Toggle de Tema** — alterna entre claro e escuro | ✅ Atributo `data-theme` validado no `<html>` |

### 🔹 2. Backend (17 Testes Unitários - xUnit / Moq / FluentAssertions)
1. **ProductServiceTests (6 testes):** Listagem, criação, resgate com sucesso, bloqueio por saldo insuficiente, bloqueio por estoque esgotado.
2. **UserServiceTests (4 testes):** Autenticação válida/inválida, criação e duplicidade.
3. **PointsServiceTests (5 testes):** Aporte, distribuição, rejeição e ordenação.
4. **SocialPostServiceTests (2 testes):** Publicação e curtidas.

### 🔹 3. Frontend (8 Testes Unitários - Vitest / RTL)
1. **LoginForm.test.tsx:** Renderização e autenticação.
2. **ProductCard.test.tsx:** Resgate, pontos faltantes, esgotado.
3. **PostCard.test.tsx:** Renderização, anexos e curtidas.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [.NET SDK 10+](https://dotnet.microsoft.com/)
- [Node.js 18+](https://nodejs.org/)

---

### Execução no Visual Studio (1 Clique no Iniciar)
1. Abra a solução **`PortalPremios.sln`** no Visual Studio.
2. Certifique-se de que o projeto de inicialização está como **`PortalPremios.Api`**.
3. Clique no botão **Iniciar / Run (F5)**:
   - A API backend (.NET) inicializará na porta `5000`.
   - O frontend Vite (`npm run dev`) será disparado automaticamente via `SpaProxy` na porta `3000`.
   - O navegador abrirá diretamente pronto para uso.

---

### Execução via Linha de Comando (CLI)

#### 1. Iniciar o Backend:
```bash
cd src/backend/PortalPremios.Api
dotnet run
```
> Backend em: `http://localhost:5000`

#### 2. Iniciar o Frontend:
```bash
cd src/frontend
npm install
npm run dev
```
> Frontend em: `http://localhost:3000`

---

## ⚙️ Como Rodar os Testes

### Testes End-to-End (Cypress) — com backend e frontend rodando:
```bash
cd src/frontend

# Modo headless (terminal):
npm run cypress:run

# Modo interativo (interface gráfica):
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

O sistema inicializa automaticamente com dados de estudo:
- **Usuário:** `admin` / **Senha:** `admin`
- **Perfil:** `Admin` (Enum `UserRole: User = 1, Manager = 2, Admin = 3`)
- **Saldo Inicial:** `1.500 pts`
- **Campanha Padrão:** `Reconhecimento & Inovação 2026` com fundo de pontos inicial disponível.
