# 🚀 Quick Setup Guide - Nursery Management System

## Prerequisites

Before you begin, ensure you have:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** (optional, for version control)

## Step-by-Step Installation

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Configure Database

1. **Create PostgreSQL Database:**
   - Open pgAdmin or your PostgreSQL client
   - Create a new database named `nursery_db`
   - Or use SQL command:
     ```sql
     CREATE DATABASE nursery_db;
     ```

2. **Update Environment Variables:**
   - Copy `.env` file if not exists
   - Edit the `DATABASE_URL` with your credentials:
     ```env
     DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/nursery_db?schema=public"
     ```

### 3️⃣ Generate Prisma Client

```bash
npm run prisma:generate
```

### 4️⃣ Run Database Migrations

```bash
npm run prisma:migrate
```

This will create all necessary tables in your database.

### 5️⃣ Seed the Database (Optional but Recommended)

```bash
node prisma/seed.js
```

This creates sample data including:
- Admin account (username: `admin`, password: `admin123`)
- 3 crop batches
- 3 customers
- 2 workers
- Sample sales and attendance records
- Raw materials

### 6️⃣ Start the Server

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

Server will start on `http://localhost:5000`

## ✅ Verify Installation

1. Open browser and go to: `http://localhost:5000`
2. You should see the API welcome message
3. Test health endpoint: `http://localhost:5000/health`

## 🔑 First Login

If you seeded the database:
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change the default password immediately!

## 📝 Testing the API

### Option 1: Using Postman

1. Import the Postman collection: `Nursery_API_Collection.postman.json`
2. Run the "Setup Admin" request (one-time only)
3. Run the "Login" request to get JWT token
4. Token will be automatically saved and used for subsequent requests

### Option 2: Using cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

**Get All Batches:**
```bash
curl http://localhost:5000/api/batches \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🗄️ Database Management

### View Database with Prisma Studio

```bash
npm run prisma:studio
```

Opens at: `http://localhost:5555`

### Reset Database

If you need to start fresh:

```bash
# Drop all tables
npx prisma migrate reset

# Re-run migrations
npm run prisma:migrate

# Re-seed
node prisma/seed.js
```

## 📂 Project Structure

```
Nursery Management Software/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js            # Sample data
├── src/
│   ├── config/            # Database connection
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── routes/            # API routes
│   ├── middleware/        # Auth & error handling
│   ├── utils/             # Helpers (invoice, backup)
│   └── constants/         # Constants
├── uploads/               # Generated invoices
├── backups/               # Database backups
├── .env                   # Environment variables
├── server.js              # Entry point
└── package.json
```

## 🔧 Common Issues & Solutions

### Issue: Database Connection Error

**Solution:**
- Check PostgreSQL service is running
- Verify DATABASE_URL credentials in `.env`
- Ensure database `nursery_db` exists

### Issue: Port Already in Use

**Solution:**
Change PORT in `.env`:
```env
PORT=5001
```

### Issue: Prisma Client Not Generated

**Solution:**
```bash
npm run prisma:generate
```

### Issue: Migration Errors

**Solution:**
Reset database and re-migrate:
```bash
npx prisma migrate reset --force
npm run prisma:migrate
```

## 🎯 Next Steps

1. **Change Admin Password**: Use the change password endpoint
2. **Configure Backup Schedule**: Edit `BACKUP_SCHEDULE` in `.env`
3. **Add Real Data**: Start creating your actual batches, customers, etc.
4. **Deploy to Production**: Set up on a cloud server with proper security

## ☁️ Deploy on Render

### Backend (Web Service)

Use the `Nursery Management Software` folder as the service root.

- Build Command:
  `npm install`
- Start Command:
  `npx prisma migrate deploy && npm start`

Set these environment variables in Render:

- `NODE_ENV=production`
- `DATABASE_URL=<your_render_postgres_url>`
- `JWT_SECRET=<your_secure_secret>`
- `JWT_EXPIRE=7d`
- `ALLOWED_ORIGINS=https://<your-frontend>.onrender.com`
- `PORT` is automatically provided by Render

### Frontend (Static Site)

Use the `nursery-frontend` folder as the service root.

- Build Command:
  `npm install && npm run build`
- Publish Directory:
  `dist`

Set this environment variable in Render:

- `VITE_API_BASE_URL=https://<your-backend>.onrender.com`

## 📞 Support

For detailed API documentation, refer to `README.md`.

---

**Happy Managing! 🌱**
