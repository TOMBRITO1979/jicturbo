# 🔄 CrWell - Ponto de Restauração

**Data**: 03 de Novembro de 2025
**Versão**: v1.3.0 - Mobile Responsive & Email Features
**Status**: ✅ Sistema Totalmente Funcional - Mobile-First & Production Ready

---

## 📦 Imagens Docker (Docker Hub)

### Backend
```bash
Image: tomautomations/crwell-backend:latest
SHA256: sha256:dc040a24daa98e249b504f80c29bdbb09b92a20a7e7d3708758ddbfd5eb189f6
Tag Específico: tomautomations/crwell-backend:v1.3.0
```

**Pull:**
```bash
docker pull tomautomations/crwell-backend:latest
# ou específico:
docker pull tomautomations/crwell-backend:v1.3.0
```

### Frontend
```bash
Image: tomautomations/crwell-frontend:latest
SHA256: sha256:413c3ae6f74b1758afddb4311627c503362c1b46930d17462ba2b634d1353ba5
Tag Específico: tomautomations/crwell-frontend:v1.3.0
```

**Pull:**
```bash
docker pull tomautomations/crwell-frontend:latest
# ou específico:
docker pull tomautomations/crwell-frontend:v1.3.0
```

### Database
```bash
Image: postgres:16-alpine
```

---

## 🔧 Configuração de Variáveis

### Variáveis Obrigatórias (.env)

```bash
# Database
POSTGRES_DB=crwell_db
POSTGRES_USER=crwell_user
POSTGRES_PASSWORD=<CONFIGURAR_SENHA_SEGURA>

# JWT
JWT_SECRET=<CONFIGURAR_JWT_SECRET_32PLUS_CHARS>
JWT_EXPIRES_IN=7d

# SMTP (configurado para emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=appcrwell@gmail.com
SMTP_PASS=<SENHA_APP_GMAIL_CONFIGURADA>
SMTP_FROM="CrWell <appcrwell@gmail.com>"

# URLs
FRONTEND_URL=https://app.crwell.pro
FRONTEND_DOMAIN=app.crwell.pro
BACKEND_DOMAIN=api.crwell.pro
BACKEND_URL=https://api.crwell.pro/api

# Docker
DOCKER_USERNAME=tomautomations
```

---

## 🗄️ Backup de Banco de Dados

### Criar Backup
```bash
# Identificar container do PostgreSQL
POSTGRES_CONTAINER=$(docker ps -q -f name=crwell_postgres | head -n 1)

# Criar backup
docker exec $POSTGRES_CONTAINER pg_dump -U crwell_user crwell_db > backup_crwell_$(date +%Y%m%d_%H%M%S).sql

# Ou backup comprimido
docker exec $POSTGRES_CONTAINER pg_dump -U crwell_user crwell_db | gzip > backup_crwell_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restaurar Backup
```bash
# Parar stack
docker stack rm crwell

# Aguardar remoção completa
sleep 30

# Limpar volume antigo
docker volume rm crwell_postgres_data

# Deployar stack novamente
docker stack deploy -c docker-compose.yml crwell

# Aguardar PostgreSQL inicializar
sleep 30

# Restaurar backup
cat backup_crwell_YYYYMMDD_HHMMSS.sql | docker exec -i $(docker ps -q -f name=crwell_postgres | head -n 1) psql -U crwell_user -d crwell_db

# Ou se for backup comprimido:
gunzip -c backup_crwell_YYYYMMDD_HHMMSS.sql.gz | docker exec -i $(docker ps -q -f name=crwell_postgres | head -n 1) psql -U crwell_user -d crwell_db
```

---

## 📂 Estrutura de Tenant Padrão

### Tenant CrWell (Padrão)
```
ID: a5533f0a-9356-485e-9ec9-d743d9884ace
Name: CrWell
Domain: crwell.pro
Plan: Enterprise
Active: true
```

### Usuário Super Admin
```
Email: superadmin@crwell.pro
Password: [SENHA_CONFIGURADA]
Role: SUPER_ADMIN
Tenant: null (acesso a todos os tenants)
```

### Criar Novo Tenant
Use a interface `/admin` (apenas SUPER_ADMIN) ou via API:
```bash
POST /api/admin/tenants
{
  "name": "Nome da Empresa",
  "domain": "empresa.com",
  "plan": "Basic|Pro|Enterprise",
  "adminEmail": "admin@empresa.com",
  "adminName": "Nome Admin",
  "adminPassword": "senha_segura"
}
```

---

## 🚀 Restauração Rápida

### Opção 1: Usando Git Tag
```bash
cd /root/crwell

# Listar tags disponíveis
git tag

# Restaurar para esta versão
git checkout v1.3.0

# Atualizar imagens Docker
docker pull tomautomations/crwell-backend:v1.3.0
docker pull tomautomations/crwell-frontend:v1.3.0

# Redeployar
docker stack deploy -c docker-compose.yml crwell
```

### Opção 2: Usando Imagens Específicas

Editar `docker-compose.yml`:
```yaml
services:
  backend:
    image: tomautomations/crwell-backend:v1.3.0  # versão específica

  frontend:
    image: tomautomations/crwell-frontend:v1.3.0  # versão específica
```

Depois:
```bash
docker stack deploy -c docker-compose.yml crwell
```

---

## ✅ Funcionalidades Nesta Versão

### Core Features
- ✅ Autenticação (login, registro, recuperação de senha)
- ✅ Multi-tenancy com isolamento completo
- ✅ RBAC (SUPER_ADMIN, ADMIN, USER)
- ✅ Permissões granulares por módulo
- ✅ Gestão de Tenants (SUPER_ADMIN)
- ✅ Gestão de Usuários (ADMIN)

### CRUD Modules
- ✅ Clientes (Customers) - CRUD completo
- ✅ Serviços (Services) - CRUD completo
- ✅ Eventos (Events) - CRUD completo
- ✅ Projetos (Projects) - CRUD completo
- ✅ Faturas (Financial) - CRUD completo
- ✅ Fluxo de Caixa (CashFlow) - CRUD completo

### Import/Export Features ⭐ NOVO
- ✅ **Clientes → CSV Export** (31 campos)
- ✅ **Clientes → CSV Import** (bulk upload com validação) 🆕
- ✅ **Eventos → CSV Export** (9 campos)
- ✅ **Eventos → PDF Export** (print-ready)

### UI/UX Improvements ⭐ NOVO
- ✅ **Rebranding completo**: JICTurbo → CrWell 🆕
- ✅ **Formulários limpos**: Removidos placeholders JSON técnicos 🆕
- ✅ **Título da aba**: Agora exibe "CrWell" 🆕
- ✅ **Placeholders amigáveis**: Descrições em português claro 🆕

### Dashboard & Reports
- ✅ Dashboard analítico
- ✅ Relatórios por módulo
- ✅ Métricas em tempo real

---

## 🐛 Problemas Conhecidos e Soluções

### Problema: DATABASE_URL vazia após docker service update --force
**Solução**: Usar `docker stack deploy` em vez de `docker service update --force`, ou setar manualmente:
```bash
docker service update \
  --env-add "DATABASE_URL=postgresql://crwell_user:SENHA@postgres:5432/crwell_db" \
  crwell_backend
```

### Problema: Labels do Traefik vazias
**Solução**: Setar manualmente após deploy:
```bash
docker service update \
  --label-add "traefik.http.routers.crwell-api.rule=Host(\`api.crwell.pro\`)" \
  crwell_backend

docker service update \
  --label-add "traefik.http.routers.crwell.rule=Host(\`app.crwell.pro\`)" \
  crwell_frontend
```

### Problema: Erros de tenantId
**Solução**: Garantir que todos os controllers aceitam `tenantId` do body para SUPER_ADMIN.

### Problema: Migrations falhando
**Solução**: Usar `npx prisma db push` em vez de `migrate deploy` em banco novo.

### Problema: Frontend não conecta ao backend
**Solução**: Verificar variável `VITE_API_URL` no build do frontend.

---

## 📊 Métricas de Performance

### Bundle Sizes
- **Backend**: ~250 MB (container completo)
- **Frontend**:
  - JavaScript: ~885 kB (gzip: ~253 kB)
  - CSS: ~25 kB (gzip: ~5 kB)
  - Total: ~910 kB minificado

### Resource Usage (Produção)
- **Backend**: 0.5-1.0 CPU, 512MB-1GB RAM
- **Frontend**: 0.25-0.5 CPU, 128MB-256MB RAM
- **PostgreSQL**: 0.5-1.0 CPU, 512MB-1GB RAM

---

## 🔐 Segurança

### Checklist de Segurança
- [x] Senhas hasheadas com bcrypt (12 rounds)
- [x] JWT com expiração (7 dias)
- [x] HTTPS em produção (Traefik + Let's Encrypt)
- [x] Validação de entrada em todos endpoints
- [x] Tenant isolation no nível de banco de dados
- [x] CORS configurado corretamente
- [x] Permissões de banco de dados corrigidas
- [ ] 2FA (planejado para futuro)
- [ ] Rate limiting (planejado para futuro)

### Variáveis Sensíveis (NUNCA commitar)
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `SMTP_PASS`
- Credenciais de usuários

---

## 📞 Suporte e Documentação

### Documentos Principais
- `CLAUDE.md` - Documentação técnica completa
- `DEPLOY-README.md` - Guia de deployment
- `DISTRIBUTION-GUIDE.md` - Guia de distribuição
- `README.md` - Overview do projeto
- `RESTORE-POINT.md` - Este arquivo

### URLs
- **Produção Frontend**: https://app.crwell.pro
- **Produção API**: https://api.crwell.pro
- **Health Check**: https://api.crwell.pro/health (interno)
- **GitHub**: https://github.com/TOMBRITO1979/jicturbo
- **Docker Hub**: https://hub.docker.com/u/tomautomations

---

## 🎯 Restauração de Emergência

### Script Completo de Restore
```bash
#!/bin/bash

# 1. Parar sistema atual
docker stack rm crwell
sleep 30

# 2. Limpar dados antigos (CUIDADO!)
docker volume rm crwell_postgres_data

# 3. Pull imagens específicas desta versão
docker pull tomautomations/crwell-backend:v1.3.0
docker pull tomautomations/crwell-frontend:v1.3.0

# 4. Checkout do código correto
cd /root/crwell
git fetch --all --tags
git checkout v1.3.0

# 5. Configurar .env (copiar de .env.example e editar)
cp .env.example .env
# EDITAR .env COM SUAS CREDENCIAIS

# 6. Deploy da stack
docker stack deploy -c docker-compose.yml crwell

# 7. Aguardar inicialização
sleep 60

# 8. Corrigir DATABASE_URL
docker service update \
  --env-add "DATABASE_URL=postgresql://crwell_user:SENHA@postgres:5432/crwell_db" \
  crwell_backend

# 9. Corrigir labels do Traefik
docker service update \
  --label-add "traefik.http.routers.crwell-api.rule=Host(\`api.crwell.pro\`)" \
  crwell_backend

docker service update \
  --label-add "traefik.http.routers.crwell.rule=Host(\`app.crwell.pro\`)" \
  crwell_frontend

# 10. Aguardar serviços
sleep 30

# 11. Executar migrations
BACKEND=$(docker ps -q -f name=crwell_backend | head -n 1)
docker exec $BACKEND npx prisma db push --accept-data-loss

# 12. Corrigir permissões do banco
POSTGRES=$(docker ps -q -f name=crwell_postgres | head -n 1)
docker exec $POSTGRES psql -U crwell_user -d crwell_db -c \
  "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO crwell_user;"
docker exec $POSTGRES psql -U crwell_user -d crwell_db -c \
  "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO crwell_user;"

# 13. Restaurar backup do banco (se houver)
# cat backup.sql | docker exec -i $(docker ps -q -f name=crwell_postgres | head -n 1) psql -U crwell_user -d crwell_db

# 14. Verificar serviços
docker stack services crwell
```

---

## 📧 Funcionalidades de Email

### SMTP Configurado
- **Email**: appcrwell@gmail.com
- **Host**: smtp.gmail.com
- **Port**: 587
- **Status**: ✅ Testado e Funcionando

### Funcionalidades Implementadas
1. **Recuperação de Senha** ✅
   - Endpoint: `POST /api/auth/request-password-reset`
   - Envia email com link de reset (expira em 1 hora)
   - Template HTML moderno e responsivo com design CrWell
   - Gradiente verde (#16a34a), ícones emoji, design card-based
   - Notas de segurança e avisos de expiração destacados
   - Link: `https://app.crwell.pro/reset-password?token=xxx`

### Testar Recuperação de Senha
```bash
curl -X POST https://api.crwell.pro/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@crwell.pro"}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "If the email exists, a reset link will be sent"
}
```

### Funcionalidades Futuras (Planejadas)
- [ ] Email de confirmação de cadastro de usuário
- [ ] Notificações de eventos/tarefas
- [ ] Relatórios por email
- [ ] Alertas de vencimento de faturas

---

## 🆕 Novidades da Versão 1.2.0

### CSV Import
- **Endpoint**: `POST /api/customers/import`
- **Formato**: Array de objetos customer
- **Validação**: Verifica campo obrigatório (fullName)
- **Resposta**: Retorna contadores de sucesso/falha e lista de erros
- **UI**: Botão "Importar CSV" com upload de arquivo
- **Parsing**: Suporta valores entre aspas e vírgulas no conteúdo

### Melhorias de UX
- Removidos 7 campos com placeholders JSON técnicos
- Substituídos por descrições em português claro
- Labels mais limpos sem menções a "(JSON)"
- Experiência mais amigável para usuários não-técnicos

### Branding
- Título do navegador alterado de "JICTurbo CRM" para "CrWell"
- package.json renomeados para crwell-frontend e crwell-backend
- Mantida compatibilidade com repositório jicturbo

---

## 🆕 Novidades da Versão 1.3.0

### 📱 Mobile Responsiveness (NOVO!)
- **Menu Hamburguer**: Botão fixo no topo para mobile
- **Sidebar Slide-in**: Menu lateral com animação suave e overlay
- **Auto-close**: Menu fecha automaticamente ao selecionar item
- **Touch-friendly**: Inputs e botões com altura mínima de 44px
- **Breakpoints**: `sm:` (640px+), `md:` (768px+)

### 📧 Email Functionality (NOVO!)
- **SMTP Configurado**: appcrwell@gmail.com
- **Recuperação de Senha**: Email com link de reset (expira em 1h)
- **Template HTML Moderno**: Design responsivo premium com:
  - Gradiente verde CrWell (#16a34a → #15803d)
  - Ícone emoji de segurança (🔐) em badge circular
  - Layout card-based com sombras e bordas arredondadas
  - Caixas de destaque para avisos (⏱️) e segurança (🛡️)
  - Footer profissional com copyright e links
  - Totalmente responsivo para mobile e desktop
- **Status**: ✅ Testado e funcionando em produção

### 🎨 Login Page Redesign (NOVO!)
- **Logo CrWell**: Destaque no topo com fundo verde
- **Background Gradiente**: `from-green-50 to-green-100`
- **Card com Shadow**: Formulário em card branco elevado
- **Inputs Responsivos**: `py-3` em mobile, `py-2` em desktop
- **Cor Verde CrWell**: `#16a34a` em todos elementos interativos

### 🔧 Layout Improvements (NOVO!)
- **Padding Responsivo**: `p-4` mobile → `p-8` desktop
- **Z-index Correto**: Menu (50), Sidebar (40), Overlay (30)
- **Transições Suaves**: 300ms em todas animações
- **Desktop Toggle**: Escondido em mobile, visível em desktop

### 📊 Bundle Size
- **Frontend**: 885.76 kB (gzip: 253.21 kB)
- **CSS**: 27.43 kB (gzip: 5.26 kB)

---

**🎉 Ponto de Restauração v1.3.0 Criado com Sucesso!**

Este documento garante que você pode restaurar o sistema exatamente neste estado funcional a qualquer momento.

**Novidades desta versão:**
- ✅ Mobile-First Responsivo
- ✅ Email SMTP Configurado e Testado
- ✅ UX Melhorado para Dispositivos Móveis
- ✅ Login Page Redesenhada
