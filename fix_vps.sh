#!/bin/bash
set -e

echo "=== PM2 DUMP ==="
pm2 dump

echo "=== PM2 SAVE ==="
pm2 save

echo "=== PM2 STARTUP ==="
sudo env PATH="$PATH:/usr/bin" /home/admin/.npm-global/lib/node_modules/pm2/bin/pm2 startup systemd -u admin --hp /home/admin

echo "=== PM2 STATUS ==="
pm2 status

echo "=== PM2 SERVICE STATUS ==="
systemctl is-active pm2-admin
systemctl is-enabled pm2-admin

echo "=== CADDY RELOAD ==="
caddy reload

echo "=== FINAL CURL TEST ==="
curl -sS -o /dev/null -w "HTTP %{http_code} | Time: %{time_total}s" https://masjid.99apps.id/

echo "=== DONE ==="
