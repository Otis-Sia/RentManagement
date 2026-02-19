# NGINX and PWA Setup - Quick Start Guide

## 🚀 Quick Deploy

To deploy the RentManagement system on your local network with PWA support:

```bash
# 1. Deploy with NGINX (requires sudo password)
./deploy.sh

# 2. Start the Django backend
cd backend
source venv/bin/activate
python manage.py runserver
```

**Access the app:**
- From any device on your network: `http://192.168.100.242`
- Backend API: `http://192.168.100.242/api/`

---

## 🎯 Alternative: Use Start Script

```bash
./start_system.sh
# Select: 2 (Production mode with NGINX)
```

This will:
- Run migrations and tests
- Start Django backend
- Build frontend
- Start NGINX

---

## 📱 Install as PWA

### On Desktop
1. Open `http://192.168.100.242` in Chrome/Edge
2. Click install icon (⊕) in address bar
3. App opens as standalone application

### On Mobile
1. Open `http://192.168.100.242` in browser
2. Tap "Share" → "Add to Home Screen"
3. Icon appears on home screen

---

## 🔄 Testing Auto-Update

The app automatically updates when you reconnect to the network:

1. Make a change to the code (e.g., edit a component)
2. Rebuild: `cd frontend && npm run build`
3. Restart NGINX: `sudo systemctl restart nginx`
4. On your device: Turn WiFi off → Turn WiFi on
5. App automatically detects and loads the update!

---

## 📁 Files Created

### Configuration
- `nginx.conf` - NGINX configuration for local network
- `deploy.sh` - Production deployment script

### PWA Files
- `frontend/public/manifest.json` - App manifest
- `frontend/public/service-worker.js` - Service worker for caching
- `frontend/src/pwa-utils.js` - Auto-update utilities
- `frontend/public/icons/` - App icons (192px & 512px)

### Updated Files
- `frontend/index.html` - Added PWA meta tags
- `frontend/src/main.jsx` - Added PWA initialization
- `frontend/vite.config.js` - Configured for network access
- `start_system.sh` - Added production mode option

---

## 🔍 Troubleshooting

**NGINX won't start:**
```bash
sudo nginx -t  # Test configuration
sudo systemctl status nginx  # Check status
sudo tail -f /var/log/nginx/error.log  # View logs
```

**Can't access from other devices:**
- Check firewall: `sudo ufw status`
- Verify IP: `hostname -I`
- Ensure devices are on same network

**PWA won't install:**
- Must use HTTPS in production (or localhost/local IP in development)
- Check browser console for errors
- Verify manifest.json is accessible

---

## 📊 Network Access Summary

| Mode | URL | Access |
|------|-----|--------|
| Development | http://localhost:5173 | Localhost |
| Dev Network | http://192.168.100.242:5173 | Local network |
| Production | http://192.168.100.242 | Local network |

---

## ✨ Features

✅ Local network broadcasting via NGINX  
✅ Installable as Progressive Web App  
✅ Auto-updates on network reconnection  
✅ Offline support with service worker  
✅ Optimized caching strategies  
✅ Mobile-friendly with app icons  

---

For detailed documentation, see [walkthrough.md](file:///home/sia/.gemini/antigravity/brain/00d7ec40-9194-458b-bed8-2fbf746953c2/walkthrough.md)
