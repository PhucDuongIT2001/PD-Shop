#!/bin/bash
# ============================================================
#  PD-Shop Deploy Script
#  Usage: ./deploy.sh <ssh-user>@<host> <path-to-pem>
#  Example: ./deploy.sh ubuntu@54.179.62.168 ~/Downloads/pdshop-key.pem
# ============================================================

set -e  # Exit on any error

# --- Config ---
REMOTE="${1:-ubuntu@54.179.62.168}"
PEM="${2:-~/Downloads/pdshop-key.pem}"
REMOTE_DIR="/home/ubuntu/pdshop"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  PD-Shop Production Deploy${NC}"
echo -e "${GREEN}  Target: ${REMOTE}${NC}"
echo -e "${GREEN}========================================${NC}"

# Step 1: Build Frontend & Backend
echo -e "\n${YELLOW}[1/4] Building React frontend...${NC}"
cd "$PROJECT_DIR/frontend"
npm run build
echo -e "${GREEN}✅ Frontend build done → dist/${NC}"

echo -e "\n${YELLOW}[1.5/4] Building Spring Boot backend locally...${NC}"
cd "$PROJECT_DIR"
./mvnw clean package -DskipTests
cp target/demo-0.0.1-SNAPSHOT.jar ./app.jar
echo -e "${GREEN}✅ Backend build done → app.jar${NC}"

# Step 2: Upload to EC2 via rsync
echo -e "\n${YELLOW}[2/4] Uploading project to EC2...${NC}"
rsync -avz --progress \
  -e "ssh -i $PEM -o StrictHostKeyChecking=no" \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='frontend/node_modules' \
  --exclude='target' \
  --exclude='*.log' \
  --exclude='.env' \
  "$PROJECT_DIR/" \
  "$REMOTE:$REMOTE_DIR/"

echo -e "${GREEN}✅ Upload done${NC}"

# Step 3: SSH into EC2 and run docker-compose
echo -e "\n${YELLOW}[3/4] Starting Docker Compose on EC2...${NC}"
ssh -i "$PEM" -o StrictHostKeyChecking=no "$REMOTE" << 'ENDSSH'
  set -e
  cd /home/ubuntu/pdshop

  echo "→ Stopping old containers (if any)..."
  sudo docker compose down --remove-orphans 2>/dev/null || true
  
  # Also stop containers in old PD-Shop folder if it exists
  if [ -d "/home/ubuntu/PD-Shop" ]; then
    echo "→ Cleaning up legacy containers in PD-Shop..."
    (cd /home/ubuntu/PD-Shop && sudo docker compose down --remove-orphans 2>/dev/null || true)
  fi
  
  # Force remove any conflicting containers with names like pdshop_mysql
  sudo docker rm -f pdshop_mysql pdshop_app pdshop_nginx 2>/dev/null || true

  echo "→ Building backend Docker image from prebuilt JAR..."
  sudo docker build -f Dockerfile.prebuilt -t pdshop_app:latest .

  echo "→ Starting all services..."
  sudo docker compose up -d

  echo "→ Waiting for services to start (30s)..."
  sleep 30

  echo "→ Container status:"
  sudo docker compose ps
ENDSSH

# Step 4: Health check
echo -e "\n${YELLOW}[4/4] Health check...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://54.179.62.168.nip.io" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Site is UP! → http://54.179.62.168.nip.io${NC}"
else
  echo -e "${YELLOW}⚠️  HTTP status: $HTTP_CODE — Containers may still be starting (wait 1-2 min)${NC}"
  echo -e "   Check logs: ssh -i $PEM $REMOTE 'cd /home/ubuntu/pdshop && docker compose logs --tail=50'"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Deploy Complete!${NC}"
echo -e "${GREEN}  🌐 http://54.179.62.168.nip.io${NC}"
echo -e "${GREEN}  🔧 Admin: http://54.179.62.168.nip.io/admin/dashboard${NC}"
echo -e "${GREEN}========================================${NC}"
