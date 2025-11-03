# 🔄 CrWell - Ponto de Restauração

**Data**: 03 de Novembro de 2025
**Versão**: v1.1.0 - Export Features
**Status**: ✅ Sistema Totalmente Funcional com Recursos de Exportação

---

## 📦 Imagens Docker (Docker Hub)

### Backend
```bash
Image: tomautomations/crwell-backend:latest
SHA256: sha256:39c5ce7a35c15f79deb9dced580086082c868ebbb847b9fab4ec20db396894b7
Tag Específico: tomautomations/crwell-backend:v1.1.0
```

**Pull:**
```bash
docker pull tomautomations/crwell-backend:latest
# ou específico:
docker pull tomautomations/crwell-backend:v1.1.0
```

### Frontend
```bash
Image: tomautomations/crwell-frontend:latest
SHA256: sha256:590b1de1fd19aa7e8b48274112eb37499803b75ee74b7f003ae63c4fda5c82f1
Tag Específico: tomautomations/crwell-frontend:v1.1.0
```

**Pull:**
```bash
docker pull tomautomations/crwell-frontend:latest
# ou específico:
docker pull tomautomations/crwell-frontend:v1.1.0
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

# SMTP (opcional para emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<SEU_EMAIL>
SMTP_PASS=<APP_PASSWORD>
SMTP_FROM="CrWell CRM <SEU_EMAIL>"

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

### Tenant CrWell (Padrão para SUPER_ADMIN)
```
ID: a5533f0a-9356-485e-9ec9-d743d9884ace
Name: CrWell
Domain: crwell.pro
Plan: Enterprise
Active: true
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
git checkout v1.1.0

# Atualizar imagens Docker
docker pull tomautomations/crwell-backend:v1.1.0
docker pull tomautomations/crwell-frontend:v1.1.0

# Redeployar
docker stack deploy -c docker-compose.yml crwell
```

### Opção 2: Usando Imagens Específicas

Editar `docker-compose.yml`:
```yaml
services:
  backend:
    image: tomautomations/crwell-backend:v1.1.0  # versão específica

  frontend:
    image: tomautomations/crwell-frontend:v1.1.0  # versão específica
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

### Export Features ⭐ NOVO
- ✅ **Clientes → CSV Export** (31 campos)
- ✅ **Eventos → CSV Export** (9 campos)
- ✅ **Eventos → PDF Export** (print-ready)

### Dashboard & Reports
- ✅ Dashboard analítico
- ✅ Relatórios por módulo
- ✅ Métricas em tempo real

---

## 🐛 Problemas Conhecidos e Soluções

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
  - JavaScript: ~882 kB (gzip: ~252 kB)
  - CSS: ~25 kB (gzip: ~5 kB)
  - Total: ~907 kB minificado

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

### URLs
- **Produção Frontend**: https://app.crwell.pro
- **Produção API**: https://api.crwell.pro
- **Health Check**: https://api.crwell.pro/health
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
docker pull tomautomations/crwell-backend:v1.1.0
docker pull tomautomations/crwell-frontend:v1.1.0

# 4. Checkout do código correto
cd /root/crwell
git fetch --all --tags
git checkout v1.1.0

# 5. Configurar .env (copiar de .env.example e editar)
cp .env.example .env
# EDITAR .env COM SUAS CREDENCIAIS

# 6. Deploy da stack
docker stack deploy -c docker-compose.yml crwell

# 7. Aguardar inicialização
sleep 60

# 8. Executar migrations
BACKEND=$(docker ps -q -f name=crwell_backend | head -n 1)
docker exec $BACKEND npx prisma db push --accept-data-loss

# 9. Restaurar backup do banco (se houver)
# cat backup.sql | docker exec -i $(docker ps -q -f name=crwell_postgres | head -n 1) psql -U crwell_user -d crwell_db

# 10. Verificar serviços
docker stack services crwell
```

---

**🎉 Ponto de Restauração Criado com Sucesso!**

Este documento garante que você pode restaurar o sistema exatamente neste estado funcional a qualquer momento.
