# 🌱 Nursery Management System - Backend API

A complete backend system for managing nursery operations including crop production, sales, workers, raw materials, expenses, and profit tracking.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Business Logic](#business-logic)
- [Database Schema](#database-schema)

## ✨ Features

### Module 1: Batch Production Management
- Track crop batches with detailed information
- Monitor total produced, dead crops, and remaining stock
- Real-time stock calculation: `Remaining = Total - Sold - Dead`
- Batch-wise sales tracking

### Module 2: Customer Sales & Billing
- Customer database management
- Automated billing calculations
- PDF invoice generation
- Sales history tracking
- Formula: `Final Bill = (Quantity × Price) + Traveling + Plantation`

### Module 3: Worker Attendance & Salary
- Worker management system
- Daily attendance tracking (FULL_DAY/HALF_DAY)
- Extra hours tracking
- Monthly salary calculation
- Formula: `Salary = (Full Days × 400) + (Half Days × 200) + (Extra Hours × 50) - Borrowed`

### Module 4: Raw Material & Expense Management
- Track raw materials (soil, seeds, fertilizers, etc.)
- Record material costs and purchase dates
- Monthly expense reports

### Module 5: Reports & Analytics
- Monthly income reports
- Monthly expense reports
- Profit calculations
- Dashboard statistics
- Batch production reports

### Security & Automation
- JWT authentication
- Password hashing with bcrypt
- Automatic daily database backups
- Input validation
- Error handling middleware

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **PDF Generation**: pdfkit
- **Backup Scheduling**: node-cron
- **Security**: helmet, cors
- **Logging**: morgan

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Steps

1. **Clone or navigate to project directory**
```bash
cd "Nursery Management Software"
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Edit `.env` file with your database credentials:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/nursery_db?schema=public"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
PORT=5000
```

4. **Generate Prisma Client**
```bash
npm run prisma:generate
```

5. **Run database migrations**
```bash
npm run prisma:migrate
```

6. **Seed the database (optional)**
```bash
node prisma/seed.js
```

7. **Start the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nursery_db"

# JWT
JWT_SECRET=change_this_to_a_secure_random_string
JWT_EXPIRE=7d

# Backup
BACKUP_DIR=./backups
BACKUP_SCHEDULE=0 2 * * *  # Daily at 2 AM

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/setup          - Create initial admin account
POST   /api/auth/login          - Admin login
PUT    /api/auth/change-password - Change password (Protected)
GET    /api/auth/me             - Get current admin info (Protected)
```

### Batches
```
POST   /api/batches                    - Create batch (Protected)
GET    /api/batches                    - Get all batches (Protected)
GET    /api/batches/:id                - Get batch by ID (Protected)
GET    /api/batches/:id/stock          - Get batch stock (Protected)
GET    /api/batches/:id/sales-summary  - Get batch sales summary (Protected)
PUT    /api/batches/:id/dead-crops     - Update dead crops (Protected)
PUT    /api/batches/:id                - Update batch (Protected)
DELETE /api/batches/:id                - Delete batch (Protected)
```

### Customers
```
POST   /api/customers           - Create customer (Protected)
GET    /api/customers           - Get all customers (Protected)
GET    /api/customers/:id       - Get customer by ID (Protected)
GET    /api/customers/search?q= - Search customers (Protected)
PUT    /api/customers/:id       - Update customer (Protected)
DELETE /api/customers/:id       - Delete customer (Protected)
```

### Sales
```
POST   /api/sales              - Record sale (Protected)
GET    /api/sales              - Get all sales (Protected)
GET    /api/sales/:id          - Get sale by ID (Protected)
GET    /api/sales/report       - Get sales report (Protected)
POST   /api/sales/:id/invoice  - Generate invoice (Protected)
DELETE /api/sales/:id          - Delete sale (Protected)
```

### Workers
```
POST   /api/workers                    - Create worker (Protected)
GET    /api/workers                    - Get all workers (Protected)
GET    /api/workers/:id                - Get worker by ID (Protected)
GET    /api/workers/:id/salary/:m/:y   - Calculate monthly salary (Protected)
PUT    /api/workers/:id                - Update worker (Protected)
DELETE /api/workers/:id                - Delete worker (Protected)
POST   /api/workers/:id/attendance     - Record attendance (Protected)
PUT    /api/attendance/:id             - Update attendance (Protected)
```

### Expenses
```
POST   /api/expenses/raw-materials     - Add raw material (Protected)
GET    /api/expenses/raw-materials     - Get all materials (Protected)
GET    /api/expenses/monthly/:m/:y     - Get monthly expenses (Protected)
GET    /api/expenses/summary           - Get expense summary (Protected)
GET    /api/expenses/raw-materials/:id - Get material by ID (Protected)
PUT    /api/expenses/raw-materials/:id - Update material (Protected)
DELETE /api/expenses/raw-materials/:id - Delete material (Protected)
```

### Reports
```
GET    /api/reports/dashboard          - Get dashboard stats (Protected)
GET    /api/reports/monthly/:m/:y      - Get monthly report (Protected)
GET    /api/reports/profit-summary     - Get profit summary (Protected)
```

## 🔐 Authentication

All endpoints except `/api/auth/login` and `/api/auth/setup` require JWT authentication.

### Login Flow

1. **Setup (One-time)**
```bash
POST /api/auth/setup
{
  "username": "admin",
  "password": "Admin@123"
}
```

2. **Login**
```bash
POST /api/auth/login
{
  "username": "admin",
  "password": "Admin@123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "username": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

3. **Use Token in Requests**
Include the token in Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 💼 Business Logic

### Stock Calculation
```javascript
Remaining Crops = Total Produced - Sold Crops - Dead Crops
```

### Billing Calculation
```javascript
Final Bill = (Crop Quantity × Price Per Crop) + Traveling Cost + Plantation Cost
```

### Worker Salary Calculation
```javascript
Monthly Salary = (Full Days × ₹400) + (Half Days × ₹200) + (Extra Hours × ₹50) - Borrowed Amount
```

### Profit Calculation
```javascript
Profit = Total Sales Income - Raw Material Expenses - Worker Salaries
```

## 🗄️ Database Schema

### Models

- **Admin**: System administrator credentials
- **Batch**: Crop production batches
- **Customer**: Customer information
- **Sale**: Sales transactions
- **Worker**: Worker details
- **Attendance**: Daily worker attendance
- **RawMaterial**: Raw material purchases

### Relationships

- One Batch → Many Sales
- One Customer → Many Sales
- One Worker → Many Attendance records

## 🔄 Automatic Backups

The system automatically backs up the PostgreSQL database daily at 2 AM (configurable).

- Backups stored in `/backups` directory
- Old backups (30+ days) automatically deleted
- Manual backup can be triggered programmatically

## 📝 Default Credentials (After Seeding)

```
Username: admin
Password: admin123
```

**⚠️ IMPORTANT**: Change these credentials immediately in production!

## 🚀 Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET` (minimum 32 characters)
3. Update database credentials
4. Enable SSL/HTTPS
5. Configure firewall rules
6. Set up monitoring and logging

## 📞 Support

For issues or questions, please refer to the source code comments or contact the development team.

---

**Built with ❤️ using Node.js, Express, and Prisma**
# nursery-Software-frontend
