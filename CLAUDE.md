# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CrWell** is a multi-tenant SaaS CRM system designed to be embedded within Chatwoot. It manages customers, services, schedules, financial records, and projects with role-based access control (Super-Admin, Admin, User).

**Key Design Principles:**
- No traditional menu navigation (accessed via direct URLs)
- Green color scheme integration (#16a34a)
- Lightweight and scalable for high-load environments
- Complete tenant isolation
- Docker Swarm deployment ready

## Technology Stack

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js (lightweight, high-performance)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with role-based access control
- **Email**: Nodemailer with SMTP (Gmail)
- **Architecture**: Multi-tenant with row-level isolation

**Why this stack?**
- Node.js is extremely lightweight and handles concurrent connections efficiently
- TypeScript provides type safety and better developer experience
- Prisma ORM offers excellent multi-tenant support and type-safe database queries
- Express.js has minimal overhead and is battle-tested for high-load scenarios

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (faster than Webpack, smaller bundles)
- **Styling**: TailwindCSS (Green color scheme - primary: #16a34a)
- **State Management**: Zustand (lightweight alternative to Redux)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **i18n**: i18next (supports pt-BR, es, en)

### DevOps
- **Container**: Docker with multi-stage builds
- **Orchestration**: Docker Swarm
- **Network**: network_public (external, shared)
- **Images**: tomautomations/* on Docker Hub
- **No Cache**: Always build with --no-cache flag

## Production URLs

- **Frontend**: https://app.crwell.pro
- **Backend API**: https://api.crwell.pro
- **Health Check**: https://api.crwell.pro/health

## Email Configuration

### SMTP Settings (Production)
- **Provider**: Gmail
- **Email**: appcrwell@gmail.com
- **Host**: smtp.gmail.com
- **Port**: 587 (TLS)
- **Status**: ✅ Configured and Tested

### Email Functionality
**Implemented:**
- ✅ Password Recovery - Sends reset link with 1-hour expiration
  - Endpoint: `POST /api/auth/request-password-reset`
  - Template: HTML responsive design with CrWell branding
  - Security: Token-based with expiration

**Planned:**
- [ ] User registration confirmation
- [ ] Event/task notifications
- [ ] Invoice due date alerts
- [ ] Email reports

### Testing Email
```bash
curl -X POST https://api.crwell.pro/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@crwell.pro"}'
```

## Project Structure

```
/root/crwell/
├── backend/                 # Node.js + TypeScript backend
│   ├── src/
│   │   ├── controllers/    # Route handlers for each module
│   │   ├── routes/         # Express routes
│   │   ├── middleware/     # Auth, error handling, tenant isolation
│   │   ├── utils/          # JWT, password hashing, email
│   │   ├── database.ts     # Prisma client instance
│   │   └── index.ts        # Main Express app
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema (multi-tenant)
│   │   └── seed.ts         # Database seeding
│   ├── Dockerfile          # Multi-stage Docker build
│   └── package.json
├── frontend/                # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/          # Login, Register, Dashboard, CRUD pages
│   │   ├── components/     # Reusable React components
│   │   ├── services/       # API client (axios)
│   │   ├── store/          # Zustand stores (auth)
│   │   ├── i18n/           # Translations (pt-BR, es, en)
│   │   ├── App.tsx         # Main app with routing
│   │   └── main.tsx        # Entry point
│   ├── Dockerfile          # Multi-stage build with Nginx
│   └── package.json
├── docker-compose.yml      # Docker Swarm configuration
└── CLAUDE.md              # This file
```

### Backend Controllers

**Implemented Controllers**:
- `auth.controller.ts` - Authentication and registration
- `admin.controller.ts` - Tenant management (SUPER_ADMIN)
- `users.controller.ts` - User management (ADMIN)
- `customers.controller.ts` - Customer CRUD
- `services.controller.ts` - Services CRUD
- `events.controller.ts` - Events CRUD
- `projects.controller.ts` - Projects CRUD
- `financial.controller.ts` - Invoices CRUD
- `reports.controller.ts` - Analytics and reports
- `settings.controller.ts` - Settings management

### Frontend Pages

**Implemented Pages**:
- `Login.tsx` - Login page
- `Register.tsx` - Registration page
- `ForgotPassword.tsx` - Password recovery
- `ResetPassword.tsx` - Password reset
- `Profile.tsx` - User profile with API token
- `Admin.tsx` - Tenant management (SUPER_ADMIN)
- `Users.tsx` - User management (ADMIN)
- `Dashboard.tsx` - Main dashboard
- `Reports.tsx` - Analytics dashboard
- `Customers.tsx` - Customer management
- `Services.tsx` - Services management
- `Events.tsx` - Events management
- `Projects.tsx` - Projects management
- `Financial.tsx` - Invoice management
- `Settings.tsx` - Settings page

## Database Schema

### Multi-Tenancy Strategy
All tables (except `tenants` and super-admin users) include a `tenantId` field for row-level isolation. Middleware automatically filters queries based on the authenticated user's tenant.

### Core Tables

#### 1. Tenants & Users
```prisma
model Tenant {
  id        String   @id @default(uuid())
  name      String
  domain    String?  @unique
  plan      String?  // Plano: Basic, Pro, Enterprise
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model User {
  id          String    @id @default(uuid())
  email       String    @unique
  password    String
  name        String
  role        Role      @default(USER)
  tenantId    String?
  permissions Json?     // Campo JSON para permissões granulares
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum Role {
  SUPER_ADMIN
  ADMIN
  USER
}
```

#### 2. Customers (Clientes)
```prisma
model Customer {
  id                    String    @id @default(uuid())
  tenantId              String

  // 1. Informações Pessoais
  fullName              String
  gender                String?   // Masculino, Feminino, Outro
  birthDate             DateTime?
  maritalStatus         String?
  nationality           String?

  // 2. Informações de Contato
  email                 String?
  phone                 String?
  whatsapp              String?
  addressStreet         String?
  addressNumber         String?
  addressNeighborhood   String?
  addressCity           String?
  addressState          String?
  addressZipCode        String?
  socialLinks           Json?     // Links de redes sociais

  // 3. Informações Profissionais
  jobTitle              String?
  company               String?
  marketSegment         String?
  acquisitionSource     String?   // Como chegou: referência, marketing, etc.

  // 4. Histórico
  firstContactDate      DateTime  @default(now())
  lastInteractionDate   DateTime?
  purchaseHistory       Json?     // Array de compras
  feedback              Json?     // Comentários, sugestões
  supportHistory        Json?     // Histórico de chamados

  // 5. Preferências
  preferredChannel      String?   // Email, WhatsApp, telefone
  contactFrequency      String?
  interestedInPromotions Boolean  @default(true)
  productPreferences    Json?

  // 6. Status
  potentialLevel        String?   // Potencial, Ativo, Inativo, Perdido
  satisfactionLevel     Int?      // 1-5
  loyaltyScore          Int?
  riskScore             Int?      // Risco de inadimplência

  // 7. Campanhas
  participatedCampaigns Json?
  newProductInterest    Boolean   @default(false)
  engagementStatus      String?

  // 8. Notas Internas
  internalNotes         String?
  assignedToId          String?   // Responsável
  importantDates        Json?     // Aniversários, eventos

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

#### 3. Services (Serviços/Produtos/Projetos Contratados)
```prisma
model Service {
  id                String    @id @default(uuid())
  tenantId          String
  customerId        String

  // Identificação
  name              String
  internalCode      String?
  category          String?   // Consultoria, Assinatura, Software, etc.

  // Contratação
  contractDate      DateTime  @default(now())
  startDate         DateTime
  endDate           DateTime?
  periodicity       String    // Único, Mensal, Anual, Recorrente

  // Situação
  status            String    // Ativo, Em Andamento, Finalizado, Cancelado
  completionPercent Int       @default(0)
  currentStage      String?   // Planejamento, Execução, Entregue

  // Detalhamento
  description       String?
  scope             String?
  contractedPackage String?   // Básico, Profissional, Enterprise
  supportLevel      String?   // Padrão, Premium, 24/7

  // Equipe
  internalResponsible String?
  assignedTeam      Json?
  clientContact     String?

  // Financeiro
  totalValue        Decimal
  paymentMethod     String?
  installments      Json?     // Cronograma de parcelas
  paymentStatus     String?   // Em dia, Atrasado, Quitado
  autoRenewal       Boolean   @default(false)

  // Documentos
  attachments       Json?     // Contratos, propostas

  // Observações
  internalNotes     String?
  scopeChanges      Json?     // Histórico de modificações
  clientFeedback    String?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

#### 4. Events (Agenda/Eventos)
```prisma
model Event {
  id                String    @id @default(uuid())
  tenantId          String
  customerId        String?

  // Informações básicas
  title             String
  type              String    // Reunião, Tarefa, Lembrete, Telefonema
  startDate         DateTime
  endDate           DateTime
  location          String?   // Endereço físico ou link

  // Participantes
  participants      Json?     // Lista de usuários/clientes
  responsibleId     String?

  // Detalhes
  description       String?
  priority          String?   // Alta, Média, Baixa
  status            String    @default("Agendado") // Agendado, Concluído, Cancelado

  // Tarefas e Follow-ups
  isTask            Boolean   @default(false)
  taskStatus        String?   // Pendente, Em Progresso, Concluída
  checklist         Json?     // Subtarefas

  // Notificações
  reminders         Json?     // Lembretes configurados

  // Integração
  externalCalendarId String?  // ID do Google Calendar/Outlook
  meetingLink       String?   // Zoom, Meet, Teams

  // Histórico
  postMeetingNotes  String?
  results           String?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

#### 5. Financial (Financeiro/Faturas)
```prisma
model Financial {
  id                String    @id @default(uuid())
  tenantId          String
  customerId        String

  // Resumo Financeiro
  totalContracted   Decimal
  totalPaid         Decimal   @default(0)
  totalOutstanding  Decimal   @default(0)
  availableCredits  Decimal   @default(0)
  creditLimit       Decimal?
  outstandingBalance Decimal  @default(0)
  isDefaulter       Boolean   @default(false)

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model Invoice {
  id                String    @id @default(uuid())
  tenantId          String
  customerId        String
  serviceId         String?

  // Identificação
  invoiceNumber     String    @unique
  description       String?

  // Datas
  issueDate         DateTime  @default(now())
  dueDate           DateTime
  paymentDate       DateTime?

  // Valores
  amount            Decimal
  paidAmount        Decimal   @default(0)
  discountAmount    Decimal   @default(0)
  feeAmount         Decimal   @default(0)

  // Status
  status            String    // Em Aberto, Pago, Vencido, Parcialmente Pago
  paymentMethod     String?   // Boleto, PIX, Cartão, Transferência

  // Parcelamento
  isInstallment     Boolean   @default(false)
  installmentNumber Int?
  totalInstallments Int?

  // Renovação
  isRecurring       Boolean   @default(false)
  recurringInterval String?   // Mensal, Anual
  nextBillingDate   DateTime?

  // Documentos
  paymentProof      String?   // Link/upload do comprovante
  taxInvoiceNumber  String?
  taxInvoiceUrl     String?

  // Observações
  notes             String?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

#### 6. Projects (Projetos em Andamento)
```prisma
model Project {
  id                String    @id @default(uuid())
  tenantId          String
  customerId        String
  serviceId         String?

  // Identificação
  name              String
  internalCode      String?
  type              String?   // Tarefa, Projeto, Suporte, Treinamento

  // Responsabilidade
  responsibleId     String?
  teamMembers       Json?

  // Datas
  startDate         DateTime
  estimatedEndDate  DateTime?
  actualEndDate     DateTime?
  lastUpdate        DateTime  @default(now())

  // Status
  status            String    // Em Progresso, Aguardando, Pausado, Concluído
  completionPercent Int       @default(0)
  currentStage      String?   // Planejamento, Execução, Revisão
  priority          String?   // Alta, Média, Baixa
  isDelayed         Boolean   @default(false)
  delayDays         Int       @default(0)

  // Detalhes
  description       String?
  scope             String?

  // Recursos
  materials         Json?
  dependencies      Json?

  // Desafios
  problems          Json?     // Problemas encontrados
  risks             Json?     // Riscos potenciais
  mitigationPlan    String?

  // Comunicação
  clientFeedback    Json?
  lastClientContact DateTime?

  // Cronograma
  milestones        Json?     // Marcos importantes

  // KPIs
  kpis              Json?
  qualityIndicators Json?

  // Notas
  internalNotes     String?
  futureActions     String?

  // Anexos
  attachments       Json?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model ProjectTask {
  id                String    @id @default(uuid())
  projectId         String

  // Identificação
  name              String
  description       String?

  // Responsabilidade
  responsibleId     String?

  // Datas
  startDate         DateTime?
  endDate           DateTime?

  // Status
  status            String    // Pendente, Em Progresso, Concluída, Atrasada

  // Observações
  comments          String?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

#### 7. Settings (Configurações)
```prisma
model Settings {
  id                String    @id @default(uuid())
  tenantId          String    @unique

  // API Keys
  googleApiKey      String?
  wahaApiKey        String?
  microsoftTeamsKey String?
  zoomApiKey        String?
  openaiApiKey      String?

  // SMTP (criptografado)
  smtpHost          String?
  smtpPort          Int?
  smtpUser          String?
  smtpPass          String?   // Deve ser criptografado
  smtpFrom          String?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

## API Architecture

### Base URL
- Development: `http://localhost:3000/api`
- Production: `https://api.crwell.pro/api`

### Authentication Endpoints
```
POST   /api/auth/register              # Criar novo usuário/tenant
POST   /api/auth/login                 # Login
POST   /api/auth/request-password-reset # Solicitar recuperação
POST   /api/auth/reset-password        # Resetar senha com token
GET    /api/auth/me                    # Obter usuário atual
POST   /api/auth/regenerate-token      # Regenerar API token
```

### Admin Endpoints (SUPER_ADMIN only)
```
GET    /api/admin/tenants              # Listar todas empresas
GET    /api/admin/tenants/:id          # Ver empresa específica
POST   /api/admin/tenants              # Criar nova empresa com admin
PUT    /api/admin/tenants/:id          # Atualizar empresa
DELETE /api/admin/tenants/:id          # Excluir empresa
GET    /api/admin/tenants/:id/users    # Listar usuários de uma empresa
```

### Users Endpoints (ADMIN and SUPER_ADMIN)
```
GET    /api/users                      # Listar usuários do tenant
GET    /api/users/:id                  # Ver usuário específico
POST   /api/users                      # Criar novo usuário
PUT    /api/users/:id                  # Atualizar usuário
DELETE /api/users/:id                  # Excluir usuário
```

### CRUD Endpoints Pattern
All modules follow the same pattern:
```
GET    /api/{module}           # List (with pagination & filters)
GET    /api/{module}/:id       # Get by ID
POST   /api/{module}           # Create
PUT    /api/{module}/:id       # Update
DELETE /api/{module}/:id       # Delete
```

Modules: `customers`, `services`, `events`, `financial`, `invoices`, `projects`, `settings`

### Reports Endpoints
```
GET    /api/reports/sales              # Relatório de vendas
GET    /api/reports/customers          # Relatório de clientes
GET    /api/reports/projects           # Relatório de projetos
GET    /api/reports/financial          # Relatório financeiro
GET    /api/reports/dashboard          # Dashboard summary
```

### Middleware Chain
```
authenticate → tenantIsolation → authorize → controller
```

## Role-Based Access Control (RBAC)

### User Roles and Permissions

**1. SUPER_ADMIN (Dono do SaaS)**
- Controle total sobre o sistema
- Pode criar e gerenciar tenants (empresas)
- Pode ativar/desativar empresas
- Acessa dados de todas as empresas
- Gerencia planos (Basic, Pro, Enterprise)
- URL de acesso: `/admin`

**2. ADMIN (Administrador do Tenant)**
- Gerencia sua própria empresa
- Cria e gerencia usuários do tenant
- Define permissões granulares por usuário
- Não pode criar outros ADMINs
- Isolado de outros tenants
- URL de acesso: `/users`

**3. USER (Usuário/Subusuário)**
- Acesso controlado via campo `permissions` (JSON)
- Permissões definidas pelo ADMIN
- Permissões por módulo:
  - `customers`: { read: boolean, write: boolean }
  - `services`: { read: boolean, write: boolean }
  - `events`: { read: boolean, write: boolean }
  - `projects`: { read: boolean, write: boolean }
  - `financial`: { read: boolean, write: boolean }
  - `reports`: { read: boolean, write: boolean }

### Permission System Example
```json
{
  "customers": { "read": true, "write": true },
  "services": { "read": true, "write": false },
  "events": { "read": true, "write": true },
  "projects": { "read": false, "write": false },
  "financial": { "read": true, "write": false },
  "reports": { "read": true, "write": false }
}
```

### Security Features
- ✅ Row-level tenant isolation
- ✅ JWT-based authentication
- ✅ Role-based authorization
- ✅ Granular permissions per module
- ✅ Cascade delete protection
- ✅ Self-preservation (users cannot delete/deactivate themselves)
- ✅ Admin restrictions (cannot create other ADMINs)

## Frontend Pages and Features

### Implemented Pages (100% Complete)

**1. Authentication Pages**
- `/login` - Login page with email/password
- `/register` - Registration with tenant creation
- `/forgot-password` - Password recovery request
- `/reset-password` - Password reset with token
- `/profile` - User profile with API token management

**2. Admin/Management Pages (SUPER_ADMIN and ADMIN)**
- `/admin` - Tenant management (SUPER_ADMIN only)
  - Create new companies with admin user
  - Edit company details (name, domain, plan)
  - Activate/deactivate companies
  - View statistics (users, customers, services, projects)
  - Delete companies (with data protection)

- `/users` - User management (ADMIN and SUPER_ADMIN)
  - Create users with role and permissions
  - Edit user details and permissions
  - Granular permissions per module (read/write)
  - Activate/deactivate users
  - Delete users (with protection)

**3. Core CRM Pages (All authenticated users)**
- `/dashboard` - Main dashboard (redirects to /reports)
- `/reports` - Analytics dashboard with metrics and quick links
- `/customers` - Customer management (full CRUD + CSV Import/Export)
- `/services` - Services and contracts (full CRUD)
- `/events` - Events and calendar (full CRUD)
- `/projects` - Project management with tasks (full CRUD)
- `/financial` - Invoice management (full CRUD)
- `/settings` - System settings and configuration
- `/profile` - User profile and API token

### Common Features Across Pages
- ✅ Search and filters
- ✅ Create/Edit modals
- ✅ View (read-only) modals
- ✅ Delete with confirmation
- ✅ Data validation
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design
- ✅ Date/currency formatting (pt-BR)
- ✅ Status badges with colors
- ✅ Dummy data for better UX

### Frontend Bundle Size
- **JavaScript**: ~423 kB (gzip: ~107 kB)
- **CSS**: ~22 kB (gzip: ~4.6 kB)
- **Framework**: React 18 + Vite + TailwindCSS

## Development Commands

### Initial Setup
```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Database Commands
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Deploy migrations (production)
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

### Docker Commands
```bash
# Create external network (once)
docker network create --driver overlay network_public

# Build images (NO CACHE - SEMPRE)
docker build --no-cache -t tomautomations/crwell-backend:latest ./backend
docker build --no-cache -t tomautomations/crwell-frontend:latest ./frontend

# Push to Docker Hub
docker login -u tomautomations
docker push tomautomations/crwell-backend:latest
docker push tomautomations/crwell-frontend:latest

# Deploy to Swarm
docker stack deploy -c docker-compose.yml crwell

# View services
docker stack services crwell
docker stack ps crwell

# View logs
docker service logs crwell_backend -f
docker service logs crwell_frontend -f

# Remove stack
docker stack rm crwell

# Update single service (CAUTION: Use docker stack deploy instead to preserve env vars and labels)
docker service update --image tomautomations/crwell-backend:latest --force crwell_backend
```

## Testing Strategy

### Testing Each Feature
After implementing each feature, test with this workflow:

1. **Backend Testing** (use curl or Postman):
```bash
# Test endpoint
curl -X POST https://api.crwell.pro/api/customers \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test Customer",...}'

# Verify in database
docker exec -it $(docker ps -q -f name=crwell_postgres) \
  psql -U crwell_user -d crwell_db -c "SELECT * FROM \"Customer\";"
```

2. **CRUD Testing Checklist**:
   - ✅ Create: Insert new record
   - ✅ Read: List all and get by ID
   - ✅ Update: Modify existing record
   - ✅ Delete: Remove record
   - ✅ Tenant Isolation: Verify users only see their tenant's data
   - ✅ Validation: Test with invalid data

3. **Frontend Testing**:
   - Open page in browser
   - Test all CRUD operations via UI
   - Verify form validation
   - Test error handling

## Deployment Process

### Production Deployment
```bash
# 1. Build and push backend
cd /root/crwell/backend
docker build --no-cache -t tomautomations/crwell-backend:latest .
docker push tomautomations/crwell-backend:latest

# 2. Build and push frontend with correct API URL
cd /root/crwell/frontend
docker build --no-cache --build-arg VITE_API_URL=https://api.crwell.pro/api \
  -t tomautomations/crwell-frontend:latest .
docker push tomautomations/crwell-frontend:latest

# 3. Deploy stack
docker stack deploy -c docker-compose.yml crwell

# 4. Run migrations
BACKEND_CONTAINER=$(docker ps -q -f name=crwell_backend | head -n 1)
docker exec $BACKEND_CONTAINER npx prisma migrate deploy

# 5. Seed database (only first time)
docker exec $BACKEND_CONTAINER npm run seed
```

### Stack Configuration (docker-compose.yml)
```yaml
version: '3.8'

networks:
  network_public:
    external: true

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: crwell_db
      POSTGRES_USER: crwell_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - network_public
    deploy:
      replicas: 1
      placement:
        constraints: [node.role == manager]

  backend:
    image: tomautomations/crwell-backend:latest
    environment:
      DATABASE_URL: postgresql://crwell_user:${DB_PASSWORD}@postgres:5432/crwell_db
      JWT_SECRET: ${JWT_SECRET}
      FRONTEND_URL: https://app.crwell.pro
    networks:
      - network_public
    deploy:
      replicas: 1
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.crwell-api.rule=Host(`api.crwell.pro`)"
        - "traefik.http.services.crwell-api.loadbalancer.server.port=3000"

  frontend:
    image: tomautomations/crwell-frontend:latest
    networks:
      - network_public
    deploy:
      replicas: 1
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.crwell.rule=Host(`app.crwell.pro`)"
        - "traefik.http.services.crwell.loadbalancer.server.port=80"

volumes:
  postgres_data:
```

## Security Considerations

**NEVER commit these to git:**
- Docker Hub tokens
- VPS passwords
- SMTP passwords and API keys
- JWT secrets
- Database credentials

**Best practices:**
- Use environment variables for all secrets
- Hash passwords with bcrypt (salt rounds = 12)
- Validate and sanitize all inputs
- Use HTTPS in production
- Implement rate limiting
- Set appropriate CORS policies

## Implementation Plan

### Phase 1: Foundation (Steps 1-5)
1. **Project Structure Setup**
   - Initialize backend with Express + TypeScript
   - Initialize frontend with React + Vite + TypeScript
   - Configure TailwindCSS with green theme (#16a34a)
   - Setup ESLint and Prettier

2. **Database Setup**
   - Create Prisma schema with all models
   - Setup PostgreSQL in Docker
   - Generate Prisma Client
   - Create initial migration

3. **Authentication System**
   - Implement JWT utilities
   - Create auth middleware
   - Build auth endpoints (register, login, password reset)
   - Setup email service with Nodemailer
   - Create login/register UI pages

4. **Multi-tenant Middleware**
   - Implement tenant isolation middleware
   - Create role-based authorization
   - Test with different user roles

5. **Docker Configuration**
   - Create Dockerfile for backend
   - Create Dockerfile for frontend (with Nginx)
   - Create docker-compose.yml for Swarm
   - Test local Docker build

### Phase 2: Core Modules (Steps 6-10)
6. **Customers CRUD**
   - Backend: Controller + Routes
   - Frontend: List, Create, Edit, Delete pages
   - Test all operations

7. **Services CRUD**
   - Backend: Controller + Routes
   - Frontend: List, Create, Edit, Delete pages
   - Test all operations

8. **Events/Agenda CRUD**
   - Backend: Controller + Routes
   - Frontend: Calendar view + CRUD
   - Test all operations

9. **Financial CRUD**
   - Backend: Controller + Routes for Financial + Invoices
   - Frontend: Financial dashboard + Invoice management
   - Test all operations

10. **Projects CRUD**
    - Backend: Controller + Routes for Projects + Tasks
    - Frontend: Project list + Task management
    - Test all operations

### Phase 3: Advanced Features (Steps 11-12)
11. **Reports Module**
    - Implement all report endpoints
    - Create report UI pages with charts
    - Test all reports

12. **Settings Page**
    - Backend: Secure API key storage
    - Frontend: Settings form
    - Test API key encryption

### Phase 4: Deployment (Steps 13-14)
13. **Production Build & Deploy**
    - Build images with --no-cache
    - Push to Docker Hub
    - Deploy to Swarm on VPS
    - Configure Traefik for SSL

14. **Final Testing & Documentation**
    - Complete end-to-end testing
    - Create deployment guide for other users
    - Document how to change URLs and passwords

## Code Style & Conventions

- **Files**: kebab-case (e.g., `auth.controller.ts`)
- **Components**: PascalCase (e.g., `CustomerList.tsx`)
- **Functions**: camelCase (e.g., `getCustomers`)
- **Constants**: UPPER_SNAKE_CASE
- **Use TypeScript strict mode**
- **Functional components only** in React
- **Always use async/await** (not .then())

## Chatwoot Integration

This system is designed to be embedded in Chatwoot:
- **Color scheme**: Use Tailwind class `bg-[#16a34a]` for primary actions (green theme)
- **No sidebar menu**: Direct URL navigation
- **Responsive**: Works in iframe/embedded mode
- **Authentication**: Can be integrated with Chatwoot auth (future)

## Replication for Other Users

To make this stack reusable:
1. Users clone the repository
2. Edit `.env` files with their own:
   - URLs (frontend/backend)
   - Database credentials
   - SMTP credentials
   - Docker Hub username
3. Run deployment commands
4. System is ready to use

The stack is infrastructure-agnostic and can run on any Docker Swarm setup.

## Current Deployment Status

### Latest Production Deployment (November 3, 2025 - v1.3.0)

**Backend Image**: `sha256:a53e81ae0aae0345cc12fee896d4d4575e54bf90790ee90b607791d9ccbd3aec`
- ✅ All CRUD endpoints operational
- ✅ Admin endpoints for tenant management
- ✅ Users endpoints for user management
- ✅ Role-based authorization middleware
- ✅ API token generation
- ✅ SMTP email configured (password recovery)

**Frontend Image**: `sha256:413c3ae6f74b1758afddb4311627c503362c1b46930d17462ba2b634d1353ba5`
- ✅ 11 pages fully implemented
- ✅ **Mobile-responsive layout** ⭐ NEW
- ✅ **Hamburger menu for mobile** ⭐ NEW
- ✅ Admin panel for SUPER_ADMIN
- ✅ User management for ADMIN
- ✅ Permissions management interface
- ✅ Bundle: 885.76 kB (gzip: 253.21 kB)

**Database**: PostgreSQL 16 with Prisma ORM
- ✅ Multi-tenant schema with row-level isolation
- ✅ All migrations applied
- ✅ API token field added to users table
- ✅ Cascade delete configured

**Services Status**: All 1/1 replicas running
- crwell_backend ✅
- crwell_frontend ✅
- crwell_postgres ✅

### System Features (100% Complete)

**✅ Implemented**:
1. User authentication (login, register, password reset)
2. Multi-tenant architecture with complete isolation
3. Role-based access control (SUPER_ADMIN, ADMIN, USER)
4. Granular permissions system
5. Tenant management (SUPER_ADMIN)
6. User management (ADMIN)
7. Customer management (full CRUD) + **CSV Export** + **CSV Import**
8. Service management (full CRUD)
9. Event management (full CRUD) + **CSV/PDF Export**
10. Project management (full CRUD)
11. Invoice management (full CRUD)
12. Analytics dashboard with reports
13. API token generation for integrations
14. Profile page with token management
15. **CSV Export for Customers** (all 31 fields)
16. **CSV Import for Customers** (bulk upload with validation)
17. **CSV/PDF Export for Events** (with print-ready PDF)
18. **Clean UX** - Removed technical JSON placeholders
19. **Mobile-Responsive Layout** - Hamburger menu, touch-friendly ⭐ NEW
20. **Email SMTP** - Password recovery emails working ⭐ NEW
21. **Login Page Redesign** - Mobile-optimized with CrWell branding ⭐ NEW

**Test Credentials**:
- Super Admin: `superadmin@crwell.pro` / `CrWell2025`
- Default Tenant: CrWell (ID: a5533f0a-9356-485e-9ec9-d743d9884ace)

### Next Steps / Future Enhancements

**Optional Improvements**:
- [ ] Implement permission enforcement on frontend (currently backend-only)
- [ ] Add user activity logs
- [ ] Add tenant usage metrics
- [ ] Implement 2FA authentication
- [ ] Add email notifications for user creation
- [ ] Add tenant billing/subscription management
- [ ] Implement file upload for documents
- [ ] Add advanced analytics and charts
- [ ] Implement WebSocket for real-time updates
- [x] ~~Add CSV export functionality~~ ✅ **IMPLEMENTED** (Customers + Events)
- [x] ~~Add CSV import functionality~~ ✅ **IMPLEMENTED v1.2.0** (Customers)
- [x] ~~Add PDF export functionality~~ ✅ **IMPLEMENTED** (Events)
- [x] ~~Clean up JSON placeholders in forms~~ ✅ **IMPLEMENTED v1.2.0**
- [x] ~~Rebrand from JICTurbo to CrWell~~ ✅ **IMPLEMENTED v1.2.0**
- [ ] Add CSV/PDF export for Services, Projects, Financial
- [ ] Add CSV import for Services, Events, Projects

---

## Import/Export Functionality

### Customers Import (CSV) ⭐ NEW in v1.2.0
- **Location**: `/customers` page
- **Button**: "Importar CSV" (green button with upload icon)
- **Endpoint**: `POST /api/customers/import`
- **Format**: CSV file with 31 fields (same as export)
- **Features**:
  - Client-side CSV parsing with quoted value support
  - Validation: fullName is required
  - Bulk upload with error reporting
  - Row-by-row error tracking
  - Success/failure counters
  - Automatic data cleaning (removes empty strings)
  - Date conversion for birthDate field
  - Tenant isolation (SUPER_ADMIN can specify tenantId)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "success": 10,
      "failed": 2,
      "errors": [
        {"row": 3, "error": "Full name is required", "data": {...}},
        {"row": 7, "error": "Invalid date format", "data": {...}}
      ]
    }
  }
  ```
- **File**: Any CSV file with headers matching customer fields
- **Example**: See `/root/crwell/sample-customers.csv`

### Customers Export (CSV)
- **Location**: `/customers` page
- **Button**: "Exportar CSV" (blue button)
- **Fields Exported** (31 total):
  - Personal: Full Name, Gender, Birth Date, Marital Status, Nationality
  - Contact: Email, Phone, WhatsApp, Full Address (Street, Number, Neighborhood, City, State, ZIP)
  - Professional: Job Title, Company, Market Segment, Acquisition Source
  - Dates: First Contact, Last Interaction
  - Preferences: Preferred Channel, Contact Frequency, Interested in Promotions
  - Status: Potential Level, Satisfaction, Loyalty Score, Risk Score
  - Engagement: New Product Interest, Engagement Status
  - Internal: Notes, Assigned To
- **File**: `clientes_YYYY-MM-DD.csv`
- **Encoding**: UTF-8 with BOM (Excel compatible)

### Events Export (CSV + PDF)
- **Location**: `/events` page
- **Buttons**:
  - "CSV" (blue) - Export to CSV
  - "PDF" (red) - Export to PDF with print layout
- **Fields Exported**:
  - CSV: Title, Type, Start Date, End Date, Location, Customer, Description, Priority, Status
  - PDF: Title, Type, Start, End, Location, Priority, Status (formatted table)
- **Files**:
  - `eventos_YYYY-MM-DD.csv`
  - `eventos_YYYY-MM-DD.pdf`
- **PDF Features**:
  - Header: "Lista de Eventos Agendados"
  - Generation date
  - Green-themed table (#16a34a)
  - Print-ready layout

### Technical Implementation
- **Libraries**:
  - `jspdf@^2.5.2` - PDF generation
  - `jspdf-autotable@^3.8.3` - Auto table in PDF
- **Client-side processing**: No server load
- **Instant download**: Blob-based file generation

---

---

## Version History

### v1.3.0 (November 3, 2025) - Mobile Responsive & Email Features
**New Features**:
- ✅ **Mobile-First Responsive Design**: Complete mobile optimization
  - Hamburger menu for mobile devices
  - Slide-in sidebar with overlay
  - Touch-friendly inputs (44px+ tap targets)
  - Responsive breakpoints: sm (640px+), md (768px+)
- ✅ **Email SMTP Configuration**: Fully functional email system
  - Password recovery emails
  - appcrwell@gmail.com configured
  - HTML templates with CrWell branding
  - 1-hour token expiration
- ✅ **Login Page Redesign**: Mobile-optimized authentication
  - CrWell logo prominence
  - Gradient background (green theme)
  - Card-based form design
  - Larger touch targets for mobile

**Technical Details**:
- Fixed z-index layering (menu: 50, sidebar: 40, overlay: 30)
- Auto-close menu on navigation
- Responsive padding: p-4 (mobile) → p-8 (desktop)
- Smooth transitions (300ms)
- SMTP: Gmail with TLS (port 587)

**Docker Images**:
- Backend: `sha256:a53e81ae0aae0345cc12fee896d4d4575e54bf90790ee90b607791d9ccbd3aec`
- Frontend: `sha256:413c3ae6f74b1758afddb4311627c503362c1b46930d17462ba2b634d1353ba5`
- Bundle size: 885.76 kB (gzip: 253.21 kB)

### v1.2.0 (November 3, 2025) - CSV Import & UX Improvements
**New Features**:
- ✅ **CSV Import for Customers**: Bulk upload customers from CSV files with validation
- ✅ **Clean UX**: Removed technical JSON placeholders from customer form (7 fields)
- ✅ **Rebranding**: Complete rebrand from JICTurbo to CrWell
  - Browser tab title: "CrWell"
  - Package names: crwell-frontend, crwell-backend
  - Production URLs: app.crwell.pro, api.crwell.pro

**Technical Details**:
- Custom CSV parser handles quoted values and commas
- Row-level error reporting with success/failure counters
- Backend endpoint: `POST /api/customers/import`
- Frontend: File upload with instant validation feedback

**UX Improvements**:
- Social Links: "Links das redes sociais (Facebook, Instagram, LinkedIn, etc.)"
- Product Preferences: "Descreva as preferências e interesses do cliente..."
- Participated Campaigns: "Liste as campanhas que o cliente participou..."
- Purchase History: "Descreva o histórico de compras do cliente (produtos, datas, valores)..."
- Customer Feedback: "Comentários, avaliações e sugestões do cliente..."
- Support History: "Descreva o histórico de chamados e atendimentos ao cliente..."
- Important Dates: "Aniversários, datas comemorativas e outros eventos importantes..."

**Docker Images**:
- Backend: `sha256:a53e81ae0aae0345cc12fee896d4d4575e54bf90790ee90b607791d9ccbd3aec`
- Frontend: `sha256:10167776e6b641f273ece3d744ae9cdd63a27ba3d9039834f3f1342d1dac166c`

### v1.1.0 (October 24, 2025) - Export Features
- ✅ CSV Export for Customers (31 fields)
- ✅ CSV/PDF Export for Events
- ✅ API token generation
- ✅ Profile page enhancements

### v1.0.0 (Initial Release)
- ✅ Core CRM functionality
- ✅ Multi-tenant architecture
- ✅ Full CRUD for all modules
- ✅ Role-based access control

---

**Last Updated**: November 3, 2025
**Current Version**: v1.3.0
**Project Status**: ✅ Production Ready - Mobile-First Multitenant SaaS CRM
**Production URL**: https://app.crwell.pro (Mobile Optimized!)
**API URL**: https://api.crwell.pro
**Email**: appcrwell@gmail.com (SMTP Configured)
