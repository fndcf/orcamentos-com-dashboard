# FLAMA - Sistema de Orçamentos

Sistema completo de gestão de orçamentos para empresas de proteção contra incêndio. Desenvolvido com React + TypeScript no frontend e Node.js + Express + Firebase no backend.

## Funcionalidades

### Gestão de Orçamentos
- **Orçamento Simples**: Criação rápida com itens básicos e valores
- **Orçamento Completo**: Detalhamento por categorias, separação de mão de obra e materiais, prazos de execução e vistoria
- **Versionamento**: Controle de versões dos orçamentos
- **Status**: Acompanhamento (aberto, aceito, recusado, expirado)
- **Duplicação**: Criação de novos orçamentos baseados em existentes
- **Geração de PDF**: Exportação profissional dos orçamentos

### Gestão de Clientes
- Cadastro completo (PJ e PF)
- Busca automática de dados por CNPJ (API Brasil)
- Histórico de orçamentos por cliente

### Configurações do Sistema
- **Serviços**: Tipos de serviços oferecidos
- **Categorias de Itens**: Agrupamento de itens por categoria
- **Itens de Serviço**: Descrições pré-definidas com unidades de medida
- **Limitações**: Textos padrão de limitações/ressalvas
- **Palavras-chave**: Monitoramento de prazos com notificações
- **Dados da Empresa**: Configurações gerais (CNPJ, endereço, validade)

### Notificações
- Alertas de prazos de palavras-chave
- Vinculação com orçamentos específicos
- Controle de leitura/arquivamento

### Relatórios e Dashboard
- Estatísticas de orçamentos
- Gráficos de desempenho
- Filtros por período

## Tecnologias

### Backend

| Tecnologia         | Versão | Uso                      |
| ------------------ | ------ | ------------------------ |
| Node.js            | 20+    | Runtime                  |
| Express            | 4.18   | Framework HTTP           |
| TypeScript         | 5.3    | Tipagem estática         |
| Firebase Admin SDK | 12.0   | Autenticação e Firestore |
| Zod                | 3.22   | Validação de schemas     |
| Jest               | 29.7   | Testes unitários         |

### Frontend

| Tecnologia          | Versão | Uso                     |
| ------------------- | ------ | ----------------------- |
| React               | 18.2   | UI Library              |
| TypeScript          | 5.3    | Tipagem estática        |
| Vite                | 5.0    | Build tool              |
| React Router        | 6.21   | Roteamento              |
| Styled Components   | 6.1    | Estilização             |
| Axios               | 1.6    | HTTP Client             |
| React Query         | 3.39   | Cache e estado servidor |
| Firebase            | 10.7   | Autenticação cliente    |
| React PDF Renderer  | 3.1    | Geração de PDFs         |
| Recharts            | 2.15   | Gráficos e relatórios   |
| Vitest              | 1.6    | Testes unitários        |

### Infraestrutura

- Firebase Firestore (Database)
- Firebase Authentication
- Firebase Hosting
- Firebase Cloud Functions

## Estrutura do Projeto

```
flama/
├── backend/
│   └── src/
│       ├── __tests__/          # Testes unitários (Jest)
│       │   ├── controllers/    # Testes de controllers
│       │   ├── services/       # Testes de services
│       │   ├── repositories/   # Testes de repositories
│       │   ├── middlewares/    # Testes de middlewares
│       │   └── mocks/          # Dados mock para testes
│       ├── config/             # Configuração do Firebase
│       ├── controllers/        # Controladores HTTP
│       ├── events/             # Sistema de eventos
│       ├── middlewares/        # CORS, auth, errors
│       ├── models/             # Interfaces TypeScript
│       ├── repositories/       # Acesso a dados (Firestore)
│       ├── routes/             # Definição de rotas
│       ├── services/           # Lógica de negócio
│       └── utils/              # Utilitários (logger, errors)
│
├── frontend/
│   └── src/
│       ├── __tests__/          # Testes unitários (Vitest)
│       │   ├── components/     # Testes de componentes
│       │   ├── contexts/       # Testes de contextos
│       │   ├── hooks/          # Testes de hooks
│       │   ├── pages/          # Testes de páginas
│       │   └── services/       # Testes de serviços
│       ├── components/         # Componentes React
│       │   ├── auth/           # Autenticação
│       │   ├── clientes/       # Componentes de clientes
│       │   ├── layout/         # Layout administrativo
│       │   ├── notificacoes/   # Notificações
│       │   ├── orcamentos/     # Orçamentos e PDF
│       │   └── ui/             # Componentes genéricos
│       ├── contexts/           # Contextos React (Auth)
│       ├── hooks/              # Hooks customizados
│       ├── pages/              # Páginas da aplicação
│       ├── services/           # Comunicação com API
│       ├── styles/             # Estilos globais
│       ├── types/              # Tipos TypeScript
│       └── utils/              # Funções utilitárias
│
├── firebase.json               # Configuração Firebase
└── .firebaserc                 # Projeto Firebase
```

## Instalação

### Pré-requisitos
- Node.js 20+
- npm ou yarn
- Conta no Firebase com projeto configurado
- Firebase CLI (`npm install -g firebase-tools`)

### Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` com as variáveis:
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Configure as credenciais do Firebase Admin SDK.

### Frontend

```bash
cd frontend
npm install
```

Crie o arquivo `.env` com as variáveis:
```env
VITE_API_URL=http://localhost:3001/api
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

## Executando o Projeto

### Desenvolvimento

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

O frontend estará disponível em `http://localhost:5173` e o backend em `http://localhost:3001`.

### Produção

**Build do Backend:**
```bash
cd backend
npm run build
npm start
```

**Build do Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

### Deploy no Firebase

```bash
# Build de ambos os projetos
cd backend && npm run build
cd ../frontend && npm run build

# Deploy completo
firebase deploy

# Deploy apenas hosting
firebase deploy --only hosting

# Deploy apenas functions
firebase deploy --only functions
```

## Testes

### Backend (Jest)

```bash
cd backend
npm test                    # Executar testes
npm run test:watch          # Modo watch
npm run test:coverage       # Com cobertura
```

### Frontend (Vitest)

```bash
cd frontend
npm test                    # Executar testes
npm run test:ui             # Interface visual
npm run test:coverage       # Com cobertura
```

## Cobertura de Testes

O projeto mantém uma cobertura de testes abrangente:

### Frontend
- **Componentes**: OrcamentoModal, NovoClienteForm, NotificationIcon, ClienteInfoCard
- **Páginas**: Configurações (EmpresaTab, ServicosTab, CategoriasTab, LimitacoesTab, PalavrasChaveTab), Login, Dashboard
- **Hooks**: useClientes, useOrcamentos, useServicos, useCategoriasItem, useLimitacoes, usePalavrasChave
- **Contextos**: AuthContext
- **Serviços**: API interceptors

### Backend
- **Controllers**: Todos os endpoints testados
- **Services**: Lógica de negócio coberta
- **Repositories**: Operações de dados
- **Middlewares**: Auth e error handling
- **Utils**: Funções utilitárias

## API Endpoints

| Método     | Endpoint                   | Descrição                |
| ---------- | -------------------------- | ------------------------ |
| GET        | `/api/health`              | Health check             |
| GET/POST   | `/api/clientes`            | Gestão de clientes       |
| GET/POST   | `/api/orcamentos`          | Gestão de orçamentos     |
| GET/POST   | `/api/servicos`            | Configuração de serviços |
| GET/POST   | `/api/categorias-item`     | Categorias de itens      |
| GET/POST   | `/api/itens-servico`       | Itens de serviço         |
| GET/POST   | `/api/limitacoes`          | Limitações padrão        |
| GET/POST   | `/api/palavras-chave`      | Palavras-chave           |
| GET/POST   | `/api/configuracoes-gerais`| Configurações gerais     |
| GET/POST   | `/api/notificacoes`        | Notificações             |

## Arquitetura

### Backend
- **Repository Pattern**: Abstração do acesso a dados
- **Service Layer**: Separação da lógica de negócio
- **Controller Layer**: Tratamento de requisições HTTP
- **Event Bus**: Comunicação entre serviços (notificações)
- **Zod Validation**: Validação de schemas de entrada
- **Error Handling**: Classes de erro customizadas

### Frontend
- **Context API**: Estado global (autenticação)
- **Custom Hooks**: Lógica reutilizável
- **React Query**: Cache e sincronização com servidor
- **Styled Components**: Estilos encapsulados
- **Discriminated Unions**: Tipos seguros para orçamentos

## Scripts Disponíveis

### Backend

| Script                  | Descrição                       |
| ----------------------- | ------------------------------- |
| `npm run dev`           | Servidor de desenvolvimento     |
| `npm run build`         | Compilar TypeScript             |
| `npm start`             | Executar versão compilada       |
| `npm test`              | Executar testes                 |
| `npm run test:watch`    | Testes em modo watch            |
| `npm run test:coverage` | Testes com cobertura            |

### Frontend

| Script                  | Descrição                       |
| ----------------------- | ------------------------------- |
| `npm run dev`           | Servidor Vite                   |
| `npm run build`         | Build de produção               |
| `npm run preview`       | Preview do build                |
| `npm run lint`          | Verificação ESLint              |
| `npm test`              | Executar testes                 |
| `npm run test:ui`       | Interface visual de testes      |
| `npm run test:coverage` | Testes com cobertura            |

## Troubleshooting

### Porta já em uso

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Erro de CORS

Verificar se `FRONTEND_URL` no backend corresponde à URL do frontend.

### Firebase não conecta

1. Verificar se as variáveis de ambiente estão corretas
2. Verificar se o projeto Firebase existe
3. Verificar se o Firestore está habilitado

## Licença

Projeto privado - FLAMA Sistemas de Proteção.
