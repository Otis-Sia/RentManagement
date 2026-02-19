# 🚀 Quick Start - Network Mode

## Start Everything
```bash
./start_system.sh
```

That's it! The script will automatically:
1. ✓ Run database migrations
2. ✓ Run system tests
3. ✓ Build production frontend
4. ✓ Configure and start NGINX
5. ✓ Start Django backend

## Access Your App
- **From any device:** `http://192.168.100.242`
- **Backend API:** `http://192.168.100.242/api/`
- **Admin:** `http://192.168.100.242/admin/`

## Features Enabled
- ✓ Local network broadcasting
- ✓ PWA installable on all devices
- ✓ Auto-updates on network reconnection
- ✓ Offline support

## Install as PWA
1. Open `http://192.168.100.242` on any device
2. Click "Install" or "Add to Home Screen"
3. Enjoy native app experience!

---

**Note:** The script requires sudo access for NGINX configuration (you'll be prompted for password).
