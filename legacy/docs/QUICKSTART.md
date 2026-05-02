# 🚀 Quick Start - Network Mode

## Prerequisites
- Java 21 installed (`java -version`)
- PostgreSQL running with `rent_management` database
- NGINX installed (for network broadcasting)

## Start Everything
```bash
./start_system.sh
```

That's it! The script will automatically:
1. ✓ Build the Java application
2. ✓ Configure and start NGINX
3. ✓ Start Micronaut backend on port 8000

## Manual Start (Development)
```bash
# Run the backend directly
./gradlew run

# Or compile first, then run
./gradlew compileJava
./gradlew run
```

## Access Your App
- **API (local):** `http://localhost:8000/api/`
- **From any device:** `http://<your-lan-ip>`
- **Backend API:** `http://<your-lan-ip>/api/`

Find your LAN IP with:
```bash
hostname -I
```

## Test API Endpoints
```bash
# List properties
curl http://localhost:8000/api/houses/

# List tenants
curl http://localhost:8000/api/tenants/

# Dashboard
curl http://localhost:8000/api/reports/dashboard/
```

## Database Configuration
Edit `src/main/resources/application.yml`:
```yaml
datasources:
  default:
    url: jdbc:postgresql://localhost:5432/rent_management
    username: postgres
    password: postgres
```

---

**Note:** The script requires sudo access for NGINX configuration (you'll be prompted for password).
