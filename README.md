# JICTurbo - Multi-tenant SaaS CRM

Sistema de CRM multitenant completo, projetado para ser embedado no Chatwoot.

## 🚀 Stack Tecnológica

- **Backend**: Node.js + TypeScript + Express + Prisma + PostgreSQL
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Deploy**: Docker Swarm
- **Redes**: network_public (externa)

## 📦 Estrutura do Projeto

```
jicturbo/
├── backend/          # API Node.js + Prisma
├── frontend/         # React App
├── docker-compose.yml
└── CLAUDE.md        # Documentação detalhada
```

## 🛠️ Desenvolvimento Local

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🐳 Deploy com Docker Swarm

### 1. Criar rede externa (uma vez)
```bash
docker network create --driver overlay network_public
```

### 2. Build e push das imagens
```bash
# Backend
cd backend
docker build --no-cache -t tomautomations/jicturbo-backend:latest .
docker push tomautomations/jicturbo-backend:latest

# Frontend
cd frontend
docker build --no-cache --build-arg VITE_API_URL=https://apijt.crmcw.com/api \
  -t tomautomations/jicturbo-frontend:latest .
docker push tomautomations/jicturbo-frontend:latest
```

### 3. Deploy no Swarm
```bash
docker stack deploy -c docker-compose.yml jicturbo
```

### 4. Aplicar migrations e seed
```bash
# Get backend container
BACKEND_CONTAINER=$(docker ps -q -f name=jicturbo_backend | head -n 1)

# Run migrations
docker exec $BACKEND_CONTAINER npx prisma migrate deploy

# Seed database (opcional)
docker exec $BACKEND_CONTAINER npm run prisma:seed
```

## 🔐 Credenciais Padrão

Após o seed, você pode usar:
- **Email**: admin@demo.com
- **Senha**: password123

## 📚 Documentação Completa

Consulte o arquivo [CLAUDE.md](./CLAUDE.md) para documentação completa incluindo:
- Arquitetura detalhada
- Schema do banco de dados
- Rotas da API
- Guias de desenvolvimento
- Troubleshooting

## 🌐 URLs de Produção

- Frontend: https://jt.crmcw.com
- API: https://apijt.crmcw.com

## 📝 Licença

MIT
