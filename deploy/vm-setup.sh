#!/bin/bash
# BabyHealth VM Setup Script
# Run this on a fresh Ubuntu 22.04 e2-micro GCP VM
set -e

echo "=== BabyHealth VM Setup ==="
echo ""

# 1. Update system
echo "[1/8] Updating system..."
sudo apt-get update -y && sudo apt-get upgrade -y

# 2. Install dependencies
echo "[2/8] Installing dependencies..."
sudo apt-get install -y git python3 python3-pip python3-venv nginx curl

# 3. Install Node.js 18
echo "[3/8] Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Clone repository
echo "[4/8] Cloning repository..."
cd /home
sudo mkdir -p /opt/babyhealth
sudo chown $USER:$USER /opt/babyhealth
git clone https://github.com/Lukasavicus/baby-health.git /opt/babyhealth

# 5. Setup backend
echo "[5/8] Setting up backend..."
cd /opt/babyhealth/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate

# 6. Build frontend
echo "[6/8] Building frontend..."
cd /opt/babyhealth/frontend
npm install
npx vite build
sudo mkdir -p /var/www/babyhealth
sudo cp -r dist/* /var/www/babyhealth/

# 7. Create systemd service for backend
echo "[7/8] Creating backend service..."
sudo tee /etc/systemd/system/babyhealth-api.service > /dev/null << 'SVCEOF'
[Unit]
Description=BabyHealth FastAPI Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/babyhealth/backend
Environment=PATH=/opt/babyhealth/backend/venv/bin:/usr/bin
Environment=STORAGE_TYPE=json
Environment=DATA_DIR=/opt/babyhealth/backend/data
ExecStart=/opt/babyhealth/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8080
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SVCEOF

sudo systemctl daemon-reload
sudo systemctl enable babyhealth-api
sudo systemctl start babyhealth-api

# 8. Configure Nginx
echo "[8/8] Configuring Nginx..."
sudo tee /etc/nginx/sites-available/babyhealth > /dev/null << 'NGXEOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # Frontend static files
    root /var/www/babyhealth;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # OpenAPI docs
    location /docs {
        proxy_pass http://127.0.0.1:8080/docs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8080/openapi.json;
        proxy_set_header Host $host;
    }

    # SPA fallback - serve index.html for all non-file routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    gzip_min_length 256;
}
NGXEOF

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/babyhealth /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo ""
echo "=== Setup Complete! ==="
echo "Backend: http://localhost:8080/api"
echo "Frontend: http://localhost (via Nginx)"
echo ""
echo "Check status:"
echo "  sudo systemctl status babyhealth-api"
echo "  sudo systemctl status nginx"
