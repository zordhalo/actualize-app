# Actualize App

A full-stack application with web and mobile components.

## Quick Start

### Prerequisites

- **Option 1 (Recommended)**: Docker Desktop installed and running
  - Download: https://www.docker.com/products/docker-desktop/
  - Modern Docker uses `docker compose` (with space) instead of `docker-compose`
- **Option 2**: MongoDB installed locally (see [Local MongoDB Setup](#local-mongodb-setup))
- **Option 3**: MongoDB Atlas cloud instance

### Start Development Environment

**With Docker (recommended):**

```bash
# Start all services (production-like)
docker compose up

# Or start with hot reload and Mongo Express UI
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Run in detached mode (background)
docker compose up -d

# Start just MongoDB
docker compose up mongodb
```

**Note**: Modern Docker Desktop uses `docker compose` (space). If you have the older standalone `docker-compose`, you can use that instead.

The application will be available at **http://localhost:3000**

## Docker Development

### What Gets Started

When you run `docker-compose up`, the following services are started:

- **Web Application** (`web`)
  - Port: 3000
  - React Router v7 application
  - Hot reload enabled in dev mode
  
- **MongoDB Database** (`mongodb`)
  - Port: 27017
  - Database: `actualize`
  - Username: `admin`
  - Password: `password123`
  - Auto-initialized with collections and indexes

- **Mongo Express** (dev mode only)
  - Port: 8081
  - Web UI for MongoDB management
  - Login: `admin` / `admin`

### Development vs Production

#### Development Mode (with hot reload)

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Features:
- ✅ Hot module replacement (HMR)
- ✅ Source code mounted as volume
- ✅ Mongo Express UI available
- ✅ Development environment variables

#### Production Mode

```bash
docker-compose up
```

Features:
- ✅ Optimized production build
- ✅ Production dependencies only
- ✅ No source code volumes

### Common Commands

#### Start Services

```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# Start with rebuild
docker compose up --build
```

#### Stop Services

```bash
# Stop containers (keeps data)
docker compose down

# Stop and remove volumes (deletes database data)
docker compose down -v

# Stop specific service
docker compose stop web
```

#### View Logs

```bash
# All services (follow mode)
docker compose logs -f

# Specific service
docker compose logs -f web
docker compose logs -f mongodb

# Last 100 lines
docker compose logs --tail=100 web
```

#### Execute Commands

```bash
# Run command in web container
docker compose exec web npm run typecheck

# Access MongoDB shell
docker compose exec mongodb mongosh -u admin -p password123

# Access container shell
docker compose exec web sh
```

### Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| Web App | http://localhost:3000 | - |
| MongoDB | mongodb://admin:password123@localhost:27017/actualize?authSource=admin | admin / password123 |
| Mongo Express (dev) | http://localhost:8081 | admin / admin |

### Environment Variables

Default environment variables are set in `docker-compose.yml`. To override:

1. Create a `.env` file in the project root
2. Add your variables:
   ```env
   MONGODB_URI=mongodb://admin:password123@mongodb:27017/actualize?authSource=admin
   JWT_SECRET=your-secret-here
   AUTH_SECRET=your-auth-secret-here
   ```

### Database Management

#### Initialization

The database is automatically initialized with:
- Collections: `assessments`, `questions`, `users`, `results`
- Indexes on `email`, `createdAt`, `assessmentId`, `userId`

See `scripts/mongo-init.js` for details.

#### Reset Database

```bash
# Stop and remove volumes
docker compose down -v

# Start again (will reinitialize)
docker compose up
```

#### Backup Database

```bash
# Export database
docker compose exec mongodb mongodump -u admin -p password123 --authenticationDatabase admin --db actualize --out /data/backup

# Copy backup from container
docker cp actualize-mongodb:/data/backup ./backup
```

#### Restore Database

```bash
# Copy backup to container
docker cp ./backup actualize-mongodb:/data/backup

# Restore
docker compose exec mongodb mongorestore -u admin -p password123 --authenticationDatabase admin --db actualize /data/backup/actualize
```

### Testing MongoDB Connection

Test your MongoDB connection with the included test script:

```bash
cd apps/web
npm run test:mongodb
```

This will:
- ✅ Test the connection
- ✅ List databases and collections
- ✅ Perform read/write operations
- ✅ Show server information

### Local MongoDB Setup (Without Docker)

If you prefer not to use Docker, you can install MongoDB locally:

1. **Install MongoDB Community Server**
   - Windows: Download from https://www.mongodb.com/try/download/community
   - Or use Chocolatey: `choco install mongodb`

2. **Start MongoDB Service**
   ```powershell
   # Windows
   net start MongoDB
   ```

3. **Update Connection String**
   - Create `.env` file in `apps/web/`:
     ```env
     MONGODB_URI=mongodb://localhost:27017/actualize
     ```

4. **Initialize Database** (optional)
   - Run the initialization script manually or let the app create collections as needed

### Troubleshooting

#### Docker Not Found

If you see `docker-compose: command not found`:

1. **Install Docker Desktop**: https://www.docker.com/products/docker-desktop/
2. **Use modern syntax**: `docker compose` (space) instead of `docker-compose` (hyphen)
3. **Restart terminal** after installing Docker Desktop
4. **Verify installation**: `docker --version`

#### Port Already in Use

If port 3000, 27017, or 8081 is already in use:

1. Stop the conflicting service, or
2. Change ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Use 3001 instead of 3000
   ```

#### Container Won't Start

```bash
# Check logs
docker compose logs web

# Rebuild from scratch
docker compose build --no-cache
docker compose up
```

#### Database Connection Issues

1. Ensure MongoDB container is running: `docker compose ps`
2. Check MongoDB logs: `docker compose logs mongodb`
3. Verify connection string matches credentials in `docker-compose.yml`
4. Test connection: `cd apps/web && npm run test:mongodb`

#### Hot Reload Not Working

In dev mode, ensure:
- Using `docker-compose.dev.yml`
- Source code is mounted as volume
- File changes are saved (not just in editor)

#### MongoDB Connection Test Fails

If the MongoDB test script fails:

1. **Check if MongoDB is running**:
   ```powershell
   # Check if port 27017 is open
   Test-NetConnection -ComputerName localhost -Port 27017
   ```

2. **Verify connection string**:
   - Default: `mongodb://admin:password123@localhost:27017/actualize?authSource=admin`
   - Set `MONGODB_URI` environment variable if different

3. **Start MongoDB**:
   - With Docker: `docker compose up mongodb`
   - Local: Ensure MongoDB service is running

### File Structure

```
.
├── docker-compose.yml          # Main compose configuration
├── docker-compose.dev.yml       # Development overrides
├── apps/web/
│   └── Dockerfile              # Web app Docker image
└── scripts/
    └── mongo-init.js           # MongoDB initialization script
```

### Production Deployment

For production deployment:

1. Update environment variables in `docker-compose.yml`
2. Change default passwords
3. Use production build:
   ```bash
   docker compose build web
   docker compose up -d
   ```

### Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Image](https://hub.docker.com/_/mongo)
- [React Router v7 Documentation](https://reactrouter.com/)
