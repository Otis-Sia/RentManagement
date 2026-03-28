# NGINX Setup Guide

## 🚀 Quick Deploy

To deploy the RentManagement system on your local network:

```bash
# Start everything (backend + NGINX)
./start_system.sh
```

**Access the app:**
- From any device on your network: `http://<your-lan-ip>`
- Backend API: `http://<your-lan-ip>/api/`

---

## 🎯 Manual NGINX Setup

If you need to configure NGINX manually:

```bash
# Test configuration
sudo nginx -t

# Restart NGINX
sudo systemctl restart nginx
```

NGINX proxies requests to the Micronaut backend running on port 8000:
- `/api/*` → proxied to `http://127.0.0.1:8000`
- `/` → proxied to `http://127.0.0.1:8000` (Thymeleaf views)
- Static assets served by Micronaut from `src/main/resources/static/`

---

## 📊 Network Access Summary

| Mode | URL | Access |
|------|-----|--------|
| Development | http://localhost:8000 | Localhost |
| Production | http://<your-lan-ip> | Local network (via NGINX) |

---

## 🔍 Troubleshooting

**NGINX won't start:**
```bash
sudo nginx -t              # Test configuration
sudo systemctl status nginx # Check status
sudo tail -f /var/log/nginx/error.log  # View logs
```

**Backend not responding:**
```bash
# Check if Micronaut is running
curl http://localhost:8000/api/houses/

# Check Gradle build
./gradlew compileJava
```

**Can't access from other devices:**
- Check firewall: `sudo ufw status`
- Verify IP: `hostname -I`
- Ensure devices are on same network
