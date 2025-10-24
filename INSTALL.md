# JICTurbo CRM - Guia de Instalação

Este guia descreve como instalar o JICTurbo CRM em uma nova VPS usando Docker Swarm.

## 📋 Pré-requisitos

- VPS com Ubuntu 20.04+ ou Debian 11+
- Docker e Docker Compose instalados
- Docker Swarm inicializado
- Traefik configurado como proxy reverso (para SSL/HTTPS)
- Domínios configurados apontando para o servidor
- Conta no Docker Hub (para usar as imagens públicas ou suas próprias)

## 🚀 Instalação Rápida

### 1. Preparar o Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Inicializar Docker Swarm (se ainda não foi feito)
docker swarm init

# Criar rede externa para Traefik
docker network create --driver overlay network_public
```

### 2. Clonar o Repositório

```bash
cd /root
git clone https://github.com/TOMBRITO1979/jicturbo.git
cd jicturbo
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas credenciais
nano .env
```

**Variáveis obrigatórias para configurar:**

```env
# Database
POSTGRES_PASSWORD=SUA_SENHA_SEGURA_AQUI

# JWT
JWT_SECRET=$(openssl rand -base64 32)

# SMTP (Gmail)
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua_senha_app_gmail

# Domínios
FRONTEND_URL=https://seu-dominio-frontend.com
FRONTEND_DOMAIN=seu-dominio-frontend.com
BACKEND_DOMAIN=api.seu-dominio.com

# Docker Hub (se usar suas próprias imagens)
DOCKER_USERNAME=seu-usuario-dockerhub
```

**Dica**: Para gerar um JWT_SECRET seguro:
```bash
openssl rand -base64 32
```

### 4. Criar docker-compose.yml a partir do template

```bash
# Copiar o template
cp docker-compose-template.yml docker-compose.yml

# Ou usar o comando envsubst para substituir variáveis
envsubst < docker-compose-template.yml > docker-compose.yml
```

**IMPORTANTE**: Certifique-se de que o arquivo `.env` está no mesmo diretório.

### 5. Configurar Traefik (se ainda não estiver configurado)

O JICTurbo usa Traefik como proxy reverso para SSL automático. Se você ainda não tem o Traefik:

```yaml
# traefik-compose.yml
version: '3.8'

networks:
  network_public:
    external: true

services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=false"
      - "--providers.docker=true"
      - "--providers.docker.swarmMode=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencryptresolver.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencryptresolver.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencryptresolver.acme.email=seu-email@gmail.com"
      - "--certificatesresolvers.letsencryptresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "traefik_letsencrypt:/letsencrypt"
    networks:
      - network_public
    deploy:
      placement:
        constraints:
          - node.role == manager

volumes:
  traefik_letsencrypt:
```

Deploy Traefik:
```bash
docker stack deploy -c traefik-compose.yml traefik
```

### 6. Deploy do JICTurbo

```bash
# Carregar variáveis de ambiente
export $(cat .env | xargs)

# Deploy da stack
docker stack deploy -c docker-compose.yml jicturbo

# Verificar status
docker stack services jicturbo
docker stack ps jicturbo
```

### 7. Aplicar Migrações do Banco de Dados

```bash
# Aguardar os serviços iniciarem (30-60 segundos)
sleep 60

# Obter ID do container backend
BACKEND_CONTAINER=$(docker ps -q -f name=jicturbo_backend | head -n 1)

# Aplicar migrações
docker exec $BACKEND_CONTAINER npx prisma migrate deploy

# (Opcional) Criar dados de exemplo
docker exec $BACKEND_CONTAINER npm run seed
```

### 8. Verificar Instalação

```bash
# Verificar serviços
docker stack services jicturbo

# Verificar logs
docker service logs jicturbo_backend --tail 50
docker service logs jicturbo_frontend --tail 50

# Testar health check
curl https://api.seu-dominio.com/health
```

**Resposta esperada:**
```json
{"status":"ok","timestamp":"2025-10-24T..."}
```

### 9. Acessar o Sistema

- **Frontend**: https://seu-dominio-frontend.com
- **Backend API**: https://api.seu-dominio.com
- **Health Check**: https://api.seu-dominio.com/health

**Credenciais de teste** (se você executou o seed):
- Admin Demo: `admin@demo1.com` / `password123`
- User Demo: `user@demo1.com` / `password123`

## 🔧 Comandos Úteis

### Gerenciar Stack

```bash
# Ver status dos serviços
docker stack services jicturbo

# Ver logs
docker service logs jicturbo_backend -f
docker service logs jicturbo_frontend -f

# Atualizar imagem
docker service update --image tomautomations/jicturbo-backend:latest --force jicturbo_backend

# Remover stack
docker stack rm jicturbo
```

### Backup do Banco de Dados

```bash
# Backup
docker exec $(docker ps -q -f name=jicturbo_postgres) pg_dump -U jicturbo jicturbo > backup.sql

# Restore
cat backup.sql | docker exec -i $(docker ps -q -f name=jicturbo_postgres) psql -U jicturbo jicturbo
```

## 🔐 Segurança

### Checklist de Segurança:

- [ ] Alterar todas as senhas padrão no `.env`
- [ ] Gerar um JWT_SECRET único e forte
- [ ] Usar Gmail App Password para SMTP
- [ ] Configurar firewall (UFW)
- [ ] Habilitar fail2ban
- [ ] Configurar backups automáticos do banco
- [ ] Atualizar certificados SSL (automático com Traefik)
- [ ] Revisar permissões de arquivos

### Configurar Firewall

```bash
# Instalar UFW
sudo apt install ufw -y

# Configurar regras
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw allow 2377/tcp   # Docker Swarm
sudo ufw allow 7946       # Docker Swarm
sudo ufw allow 4789/udp   # Docker Overlay

# Ativar firewall
sudo ufw enable
```

## 🛠️ Desenvolvimento Local

Se você quiser fazer alterações e build local:

### 1. Build das Imagens

```bash
# Backend
cd backend
npm run build
docker build -t seu-usuario/jicturbo-backend:latest .

# Frontend
cd frontend
docker build --build-arg VITE_API_URL=https://api.seu-dominio.com/api \
  -t seu-usuario/jicturbo-frontend:latest .
```

### 2. Push para Docker Hub

```bash
# Login
docker login -u seu-usuario

# Push
docker push seu-usuario/jicturbo-backend:latest
docker push seu-usuario/jicturbo-frontend:latest
```

### 3. Atualizar docker-compose.yml

Alterar as imagens para usar suas próprias:
```yaml
image: seu-usuario/jicturbo-backend:latest
image: seu-usuario/jicturbo-frontend:latest
```

## 📚 Documentação Adicional

- **CLAUDE.md**: Documentação técnica completa do projeto
- **README.md**: Visão geral e features do sistema
- **Backend API**: Consulte `/api/docs` (se swagger estiver configurado)

## 🆘 Solução de Problemas

### Erro: "network network_public not found"
```bash
docker network create --driver overlay network_public
```

### Erro: "Prisma can't reach database"
- Verificar se postgres está rodando: `docker service ls`
- Verificar DATABASE_URL no .env
- Aguardar alguns segundos e tentar novamente

### Erro: "Invalid credentials"
- Verificar se as migrações foram aplicadas
- Verificar se o seed foi executado (para ter usuários de teste)
- Criar um novo usuário via API POST /api/auth/register

### Serviço não inicia
```bash
# Ver logs detalhados
docker service ps jicturbo_backend --no-trunc
docker service logs jicturbo_backend --tail 100
```

### SSL não funciona
- Verificar se Traefik está rodando
- Verificar se os domínios estão apontando para o servidor
- Verificar labels do Traefik no docker-compose.yml
- Aguardar alguns minutos para Let's Encrypt emitir certificado

## 📞 Suporte

- **GitHub Issues**: https://github.com/TOMBRITO1979/jicturbo/issues
- **Email**: Configurar no .env

## 📝 Licença

Este projeto é de código aberto. Consulte o arquivo LICENSE para mais detalhes.

---

**Versão**: 1.0.0
**Última Atualização**: Outubro 2025
**Status**: ✅ Production Ready
