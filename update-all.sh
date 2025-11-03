#!/bin/bash
set -e

echo "=========================================="
echo "  CrWell - Atualização Completa"
echo "=========================================="
echo ""

# Navegar para o diretório do projeto
cd /root/crwell

# 1. Fazer backup do estado atual
echo "📦 Criando backup do estado atual..."
BACKUP_DIR="/root/backups/crwell-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r /root/crwell "$BACKUP_DIR/"
echo "✅ Backup criado em: $BACKUP_DIR"
echo ""

# 2. Verificar mudanças
echo "📋 Verificando mudanças..."
git status
echo ""

# 3. Adicionar todas as mudanças
echo "➕ Adicionando mudanças ao Git..."
git add CLAUDE.md frontend/src/components/Layout.tsx
echo "✅ Arquivos adicionados"
echo ""

# 4. Commit das mudanças
echo "💾 Fazendo commit..."
git commit -m "$(cat <<'EOF'
Update sidebar menu order and fix CLAUDE.md URLs

- Reordered sidebar: Dashboard, Agenda, Clientes, Serviços, Projetos, Financeiro, Fluxo de Caixa, Relatórios, Configurações, Perfil
- Fixed API URLs: apiapp.crwell.pro -> api.crwell.pro
- Updated folder path references: /root/jicturbo/ -> /root/crwell/

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
echo "✅ Commit realizado"
echo ""

# 5. Push para GitHub
echo "📤 Enviando para GitHub..."
git push origin main
echo "✅ Push realizado"
echo ""

# 6. Carregar variáveis de ambiente
echo "📋 Carregando variáveis de ambiente..."
export $(cat .env | grep -v '^#' | xargs)
echo "✅ Variáveis carregadas"
echo ""

# 7. Build da nova imagem do frontend
echo "🏗️  Buildando nova imagem do frontend..."
docker build --no-cache \
  --build-arg VITE_API_URL=${BACKEND_URL} \
  -t ${DOCKER_USERNAME}/crwell-frontend:latest ./frontend
echo "✅ Frontend buildado"
echo ""

# 8. Push das imagens para Docker Hub
echo "📤 Enviando imagens para Docker Hub..."
if [ -n "$DOCKER_HUB_TOKEN" ]; then
    echo $DOCKER_HUB_TOKEN | docker login -u $DOCKER_USERNAME --password-stdin
fi

docker push ${DOCKER_USERNAME}/crwell-frontend:latest
echo "✅ Frontend enviado para Docker Hub"
echo ""

# 9. Atualizar serviço em produção
echo "🚀 Atualizando serviço frontend em produção..."
docker service update --image ${DOCKER_USERNAME}/crwell-frontend:latest --force crwell_frontend 2>/dev/null || \
docker service update --image ${DOCKER_USERNAME}/crwell-frontend:latest --force jicturbo_frontend 2>/dev/null || \
echo "⚠️  Nenhuma stack 'crwell' ou 'jicturbo' encontrada. Deploy manualmente se necessário."
echo ""

# 10. Verificar status
echo "📊 Status dos serviços:"
docker service ls | grep -E "crwell|jicturbo" || echo "Nenhum serviço encontrado"
echo ""

echo "=========================================="
echo "  ✅ Atualização Completa Concluída!"
echo "=========================================="
echo ""
echo "📦 Backup: $BACKUP_DIR"
echo "🐙 GitHub: Atualizado"
echo "🐳 Docker Hub: tomautomations/crwell-frontend:latest"
echo "🚀 Produção: Serviço atualizado (se estava rodando)"
echo ""
echo "Para verificar os logs do frontend:"
echo "  docker service logs crwell_frontend -f"
echo ""
