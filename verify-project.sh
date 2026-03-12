#!/bin/zsh

echo "🔎 Verificando projeto Patxanga..."
echo "-----------------------------------"

ERRORS=0

# 1. Verificar se é repositório git
if [ ! -d ".git" ]; then
  echo "❌ Não é um repositório Git."
  exit 1
fi

# 2. Verificar branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo "Branch atual: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "develop" ]; then
  echo "⚠️ Branch atual não é develop."
fi

# 3. Verificar branches remotas
echo "Branches:"
git branch -a

if ! git branch -a | grep -q "origin/main"; then
  echo "❌ origin/main não encontrado."
  ERRORS=1
fi

if ! git branch -a | grep -q "origin/develop"; then
  echo "❌ origin/develop não encontrado."
  ERRORS=1
fi

# 4. Verificar estrutura principal
echo "Verificando estrutura de pastas..."

REQUIRED_DIRS=(
  "docs"
  "docs/archive"
  "sql"
  "frontend"
  "edge-functions"
  "diagrams"
)

for DIR in "${REQUIRED_DIRS[@]}"; do
  if [ ! -d "$DIR" ]; then
    echo "❌ Pasta ausente: $DIR"
    ERRORS=1
  fi
done

# 5. Verificar arquivos docs
REQUIRED_DOCS=(
  "docs/00-index.md"
  "docs/01-product-vision.md"
  "docs/02-functional-spec.md"
  "docs/03-technical-architecture.md"
  "docs/04-database-model.md"
  "docs/05-api-contracts.md"
  "docs/06-game-engine-rules.md"
  "docs/07-bot-engine.md"
  "docs/08-realtime-flow.md"
  "docs/09-deployment-plan.md"
)

for FILE in "${REQUIRED_DOCS[@]}"; do
  if [ ! -f "$FILE" ]; then
    echo "❌ Arquivo ausente: $FILE"
    ERRORS=1
  fi
done

# 6. Verificar gitignore
if [ ! -f ".gitignore" ]; then
  echo "❌ .gitignore não encontrado."
  ERRORS=1
else
  if ! grep -q "*.log" .gitignore; then
    echo "⚠️ .gitignore pode não estar configurado corretamente."
  fi
fi

# 7. Verificar status limpo
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️ Há alterações não commitadas."
else
  echo "Working tree clean."
fi

# 8. Mostrar últimos commits
echo "Últimos commits:"
git log --oneline --decorate --graph -5

echo "-----------------------------------"

if [ $ERRORS -eq 0 ]; then
  echo "✅ BASE OK — Projeto estruturado corretamente."
else
  echo "❌ ERROS ENCONTRADOS — Revisar mensagens acima."
fi
