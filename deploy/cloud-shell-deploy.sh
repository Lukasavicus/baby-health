#!/bin/bash
# ============================================
# BabyHealth - One-Command GCP Deploy
# Cole este script inteiro no Cloud Shell
# ============================================
set -e

PROJECT_ID="baby-health-492304"
ZONE="us-central1-a"
VM_NAME="babyhealth-vm"

echo "========================================="
echo "  BabyHealth - Deploy Automatico"
echo "========================================="
echo ""

# 1. Set project
echo "[1/5] Configurando projeto..."
gcloud config set project $PROJECT_ID

# 2. Enable APIs
echo "[2/5] Habilitando APIs..."
gcloud services enable compute.googleapis.com --quiet 2>/dev/null || true

# 3. Create firewall rule
echo "[3/5] Criando regra de firewall..."
gcloud compute firewall-rules create allow-http \
  --allow tcp:80,tcp:8080 \
  --target-tags http-server \
  --description "Allow HTTP for BabyHealth" \
  --quiet 2>/dev/null || echo "  (regra ja existe, ok)"

# 4. Create VM with startup script
echo "[4/5] Criando VM e2-micro (free tier)..."
gcloud compute instances create $VM_NAME \
  --zone=$ZONE \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-standard \
  --tags=http-server \
  --network-tier=STANDARD \
  --metadata=startup-script='#!/bin/bash
set -e
exec > /var/log/babyhealth-setup.log 2>&1
echo "=== BabyHealth Setup Started $(date) ==="

apt-get update -y
apt-get install -y git python3 python3-pip python3-venv nginx curl

curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

git clone https://github.com/Lukasavicus/baby-health.git /opt/babyhealth

cd /opt/babyhealth/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate

cd /opt/babyhealth/frontend
npm install
npx vite build
mkdir -p /var/www/babyhealth
cp -r dist/* /var/www/babyhealth/

cat > /etc/systemd/system/babyhealth-api.service << SVCEOF
[Unit]
Description=BabyHealth FastAPI Backend
After=network.target
[Service]
Type=simple
User=root
WorkingDirectory=/opt/babyhealth/backend
Environment=PATH=/opt/babyhealth/backend/venv/bin:/usr/bin
ExecStart=/opt/babyhealth/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3
[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
systemctl enable babyhealth-api
systemctl start babyhealth-api

cat > /etc/nginx/sites-available/babyhealth << NGXEOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    root /var/www/babyhealth;
    index index.html;
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
    location /docs { proxy_pass http://127.0.0.1:8000/docs; proxy_set_header Host \$host; }
    location /openapi.json { proxy_pass http://127.0.0.1:8000/openapi.json; }
    location / { try_files \$uri \$uri/ /index.html; }
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
NGXEOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/babyhealth /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

echo "=== BabyHealth Setup Complete $(date) ==="
'

# 5. Get external IP
echo "[5/5] Obtendo IP externo..."
sleep 5
EXTERNAL_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo ""
echo "========================================="
echo "  DEPLOY COMPLETO!"
echo "========================================="
echo ""
echo "  VM: $VM_NAME ($ZONE)"
echo "  IP: $EXTERNAL_IP"
echo ""
echo "  O startup script esta instalando tudo."
echo "  Aguarde ~5-8 minutos."
echo ""
echo "  App:  http://$EXTERNAL_IP"
echo "  API:  http://$EXTERNAL_IP/api"
echo "  Docs: http://$EXTERNAL_IP/docs"
echo ""
echo "  Para acompanhar o progresso:"
echo "  gcloud compute ssh $VM_NAME --zone=$ZONE -- tail -f /var/log/babyhealth-setup.log"
echo ""
echo "========================================="
