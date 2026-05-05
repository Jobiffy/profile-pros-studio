#!/usr/bin/env bash
# One-time setup for the EC2 instance hosting ai.jobiffy.co.
# Run as the default 'ubuntu' user with sudo. Re-runnable.
#
#   curl -sSL <raw-url>/deploy/ec2-bootstrap.sh | bash
#   # or: scp this file to the instance and run `bash ec2-bootstrap.sh`
#
# After this finishes:
#   1. Copy deploy/nginx.conf to /etc/nginx/sites-available/ai.jobiffy.co
#   2. ln -s /etc/nginx/sites-available/ai.jobiffy.co /etc/nginx/sites-enabled/
#   3. nginx -t && systemctl reload nginx
#   4. (optional) certbot --nginx -d ai.jobiffy.co
#   5. Point ai.jobiffy.co A record at this instance's public IP
#   6. Add SSH deploy key to /home/deploy/.ssh/authorized_keys
#   7. Add EC2_HOST / EC2_USER / EC2_SSH_KEY secrets to the GitHub repo

set -euo pipefail

DEPLOY_USER=deploy
APP_ROOT=/var/www/dev/ai-resume-builder

echo "==> Updating apt and installing nginx + certbot + rsync"
sudo apt-get update -y
sudo apt-get install -y nginx certbot python3-certbot-nginx rsync ca-certificates

echo "==> Creating deploy user (no shell login, SSH-only)"
if ! id -u "$DEPLOY_USER" >/dev/null 2>&1; then
    sudo useradd --system --create-home --shell /bin/bash "$DEPLOY_USER"
fi
sudo mkdir -p "/home/$DEPLOY_USER/.ssh"
sudo chmod 700 "/home/$DEPLOY_USER/.ssh"
sudo touch "/home/$DEPLOY_USER/.ssh/authorized_keys"
sudo chmod 600 "/home/$DEPLOY_USER/.ssh/authorized_keys"
sudo chown -R "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"

echo "==> Creating web root $APP_ROOT (owned by deploy, readable by nginx)"
sudo mkdir -p "$APP_ROOT"
sudo chown -R "$DEPLOY_USER:www-data" /var/www/dev
sudo chmod -R 755 /var/www/dev

echo "==> Placing a temporary index.html so the route returns something before first deploy"
if [ ! -f "$APP_ROOT/index.html" ]; then
    sudo -u "$DEPLOY_USER" tee "$APP_ROOT/index.html" >/dev/null <<'HTML'
<!doctype html>
<html><head><meta charset="utf-8"><title>Jobiffy AI Resume Builder</title></head>
<body><h1>Coming soon</h1><p>Deploying…</p></body></html>
HTML
fi

echo "==> Enabling firewall rules (UFW). Note: AWS security group also needs ports 80/443/22 open."
if command -v ufw >/dev/null 2>&1; then
    sudo ufw allow OpenSSH || true
    sudo ufw allow 'Nginx Full' || true
    sudo ufw --force enable || true
fi

echo
echo "==> Bootstrap complete."
echo
echo "Next steps (manual):"
echo "  sudo cp deploy/nginx.conf /etc/nginx/sites-available/ai.jobiffy.co"
echo "  sudo ln -sf /etc/nginx/sites-available/ai.jobiffy.co /etc/nginx/sites-enabled/ai.jobiffy.co"
echo "  sudo rm -f /etc/nginx/sites-enabled/default"
echo "  sudo nginx -t && sudo systemctl reload nginx"
echo
echo "Add your CI deploy public key to:"
echo "  /home/$DEPLOY_USER/.ssh/authorized_keys"
echo
echo "Then test from your laptop:"
echo "  ssh $DEPLOY_USER@<this-host>  # should land in $DEPLOY_USER's home"
