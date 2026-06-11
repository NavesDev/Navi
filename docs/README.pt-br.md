# Navi 🌌

Navi é um aplicativo de assistente pessoal com inteligência artificial projetado para ajudar você a gerenciar suas finanças, metas, hábitos, projetos e produtividade por meio de conversas em linguagem natural. A plataforma conta também com um dashboard administrativo moderno para visualização gráfica das informações estruturadas.

---

## 👁️ Visão do Produto

O Navi simplifica o autogerenciamento. Em vez de abrir aplicativos complexos e preencher formulários extensos para registrar um gasto, acompanhar um hábito ou atualizar uma tarefa, o usuário simplesmente conversa com o Navi. O assistente de IA interpreta a intenção, processa a informação e atualiza os dados correspondentes de forma transparente.

---

## 🛠️ Stack Definida

O projeto utiliza uma arquitetura moderna e escalável de **Monorepo**:

* **Gerenciador de Monorepo**: [pnpm Workspaces](https://pnpm.io/workspaces) para compartilhamento ágil de pacotes locais.
* **Frontend Mobile**: [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/) (TypeScript) para rodar nativamente em iOS e Android.
* **Frontend Web (Dashboard)**: [React](https://react.dev/) com [Vite](https://vite.dev/) (TypeScript) para a área analítica administrativa.
* **Backend**: [Ruby on Rails 8.1](https://rubyonrails.org/) em modo API, fornecendo velocidade de desenvolvimento, segurança e estrutura robusta.
* **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/) hospedado no [Neon Serverless PostgreSQL](https://neon.tech/) para escalabilidade dinâmica e branching de dados.
* **Infraestrutura & Deploy**:
  * **Local**: Docker & Docker Compose.
  * **Produção VM**: Google Cloud Compute Engine (VM 24/7) configurado com [Kamal](https://kamal-deploy.org/) para implantação simplificada com contêineres Docker.
* **Inteligência Artificial (Futuro)**: Integração com a API do Google Gemini via SDK oficial.

---

## 📂 Estrutura do Monorepo

```
navi/
├── apps/
│   ├── mobile/             # Aplicativo React Native & Expo
│   └── web/                # Dashboard administrativo React & Vite
├── services/
│   └── api/                # API Backend em Ruby on Rails 8.1
├── packages/
│   ├── config/             # Configurações compartilhadas (TypeScript, etc.)
│   ├── shared/             # Utilitários compartilhados (formatação, cálculos de streak, etc.)
│   └── types/              # Definições de tipos TS do domínio do app
├── infra/
│   ├── docker/             # Configurações do Docker & Compose local
│   └── google-cloud/       # Documentação de infraestrutura no GCP
├── docs/                   # Documentação arquitetural, diagramas e guias
├── package.json            # Scripts de automação do monorepo
├── pnpm-workspace.yaml     # Configuração de workspaces do pnpm
└── README.md               # Documentação principal
```

---

## 🎯 Funcionalidades Planejadas

1. **Interface de Chat com IA**: Entrada em linguagem natural interpretada pela IA para categorizar comandos automaticamente.
2. **Controle Financeiro Simplificado**: Registro instantâneo de receitas/despesas, saldo atualizado, metas de economia e categorização automatizada de transações.
3. **Gestão de Hábitos**: Registro de hábitos diários/semanais com gamificação (streaks de dias consecutivos).
4. **Metas Pessoais**: Acompanhamento de progresso de metas de curto, médio e longo prazo.
5. **Gerenciador de Projetos e Tarefas**: Organização de fluxos de trabalho, listas de afazeres, prazos e lembretes integrados.
6. **Dashboard Analítico**: Painel web com gráficos interativos de fluxo de caixa, performance de hábitos e tarefas concluídas.

---

## 🧠 Decisões Técnicas

* **Monorepo com pnpm Workspaces**: Facilita a manutenção de tipos TypeScript unificados (`@navi/types`) e utilitários de formatação comuns (`@navi/shared`), reduzindo a duplicação de dependências e mantendo o build rápido.
* **Rails em Modo API**: Rails elimina a necessidade de escolher e integrar dezenas de bibliotecas para autenticação, envio de e-mails, processamento de jobs secundários (Solid Queue) e cache (Solid Cache), que já vêm nativos no Rails 8.
* **Neon PostgreSQL**: A estrutura serverless do Neon reduz os custos de banco de dados para quase zero no desenvolvimento e inicialização do produto, além de oferecer instant backups e branches de dados para testes isolados.
* **Kamal no Google Cloud VM**: O Kamal nos liberta da dependência de plataformas proprietárias (PaaS) caras, permitindo rodar tudo de forma simples em uma única máquina virtual Compute Engine sob demanda.

---

## 🚀 Como Instalar e Executar

### Pré-requisitos
* Node.js >= 22.0.0
* pnpm >= 11.0.0
* Ruby >= 3.4.0 e Rails >= 8.1.0
* Docker & Docker Compose (opcional para banco local)

### 1. Instalar as dependências do Monorepo
Na raiz do projeto, execute:
```bash
pnpm install
```

---

### 2. Executar o Aplicativo Mobile (Expo)

Para iniciar o servidor Metro Bundler do Expo para desenvolvimento mobile:
```bash
# Iniciar o Expo pelo script do monorepo
pnpm dev:mobile

# Ou navegue até a pasta e execute diretamente
cd apps/mobile
pnpm start
```
Você pode abrir o app em um simulador Android/iOS ou escanear o código QR com o app **Expo Go** no seu smartphone físico.

---

### 3. Configurar e Executar o Backend (Rails API)

#### Configurando o Neon PostgreSQL (`DATABASE_URL`)
Para o desenvolvimento local ou produção conectando ao Neon, você precisa configurar a variável de ambiente `DATABASE_URL`.

1. Crie um banco de dados no painel da **Neon**.
2. Copie a string de conexão fornecida (que deve conter o parâmetro `sslmode=require`).
3. Defina a variável de ambiente localmente. Você pode criar um arquivo `.env` na raiz do diretório `services/api/`:

```env
DATABASE_URL="postgresql://[USUARIO]:[SENHA]@[HOST-NEON]/neondb?sslmode=require"
```

*Nota: O `database.yml` do projeto está configurado para ler automaticamente esta variável se ela estiver definida.*

#### Rodar o Banco de Dados Localmente (PostgreSQL 18 com Docker)
Se você preferir rodar o **PostgreSQL 18** localmente em vez de usar o Neon para o ambiente de desenvolvimento, utilize o Docker Compose:

1. Suba o container do banco:
   ```bash
   cd infra/docker
   docker compose up -d db
   ```
2. Defina a variável de ambiente criando um arquivo `services/api/.env` com a URL do banco local:
   ```env
   DATABASE_URL="postgres://postgres:local_postgres_password@localhost:5432/api_development"
   ```

#### Executar Migrations e Iniciar Servidor Rails
A partir da raiz do monorepo:
```bash
# Executa migrações do banco
pnpm --filter @navi/api db:setup

# Inicia o servidor local da API (porta 3000)
pnpm dev:api
```
A API estará rodando em `http://localhost:3000`.

---

### 4. Executar o Dashboard Web (Vite)

Para iniciar a interface web do dashboard administrativo:
```bash
pnpm dev:web
```
O dashboard estará disponível em `http://localhost:5173`.

---

## 📈 Status Inicial do Projeto

* [x] Estrutura monorepo inicializada com `pnpm workspaces`.
* [x] Aplicativo mobile Expo configurado com TypeScript e suporte a dependências locais.
* [x] Dashboard web Vite + React criado e configurado com TypeScript.
* [x] API inicial em Ruby on Rails 8.1 gerada no formato `--api` com PostgreSQL.
* [x] Pacote compartilhado `@navi/types` criado com os modelos de domínio do Navi.
* [x] Pacote compartilhado `@navi/shared` criado com utilitários iniciais de formatação e cálculo de streaks.
* [x] Configuração de Docker Compose local criada para banco de dados PostgreSQL.
* [x] Documentação de implantação no GCP e de arquitetura do sistema documentada.
