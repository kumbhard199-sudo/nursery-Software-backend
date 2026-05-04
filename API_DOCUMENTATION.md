# 📡 API Documentation - Nursery Management System

Complete API reference for all endpoints. All protected endpoints require JWT authentication.

## Table of Contents

1. [Authentication](#authentication)
2. [Batches](#batches)
3. [Customers](#customers)
4. [Sales](#sales)
5. [Workers](#workers)
6. [Expenses](#expenses)
7. [Reports](#reports)

---

## Authentication

### POST `/api/auth/setup`
**One-time admin account creation**

**Body:**
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin account created successfully",
  "data": {
    "admin": {
      "id": 1,
      "username": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### POST `/api/auth/login`
**Admin login**

**Body:**
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Response:**
```json
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

---

### PUT `/api/auth/change-password` 🔒
**Change admin password**

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "currentPassword": "Admin@123",
  "newPassword": "NewSecure@456"
}
```

---

### GET `/api/auth/me` 🔒
**Get current admin info**

**Headers:** `Authorization: Bearer <token>`

---

## Batches

### POST `/api/batches` 🔒
**Create new crop batch**

**Body:**
```json
{
  "batchName": "Batch-2024-A",
  "cropType": "Ornamental Plants",
  "totalProduced": 500,
  "notes": "High quality plants"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Batch created successfully",
  "data": {
    "batch": {
      "id": 1,
      "batchName": "Batch-2024-A",
      "cropType": "Ornamental Plants",
      "totalProduced": 500,
      "deadCrops": 0,
      "createdDate": "2024-03-12T00:00:00.000Z"
    }
  }
}
```

---

### GET `/api/batches` 🔒
**Get all batches with stock calculation**

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": {
    "batches": [
      {
        "id": 1,
        "batchName": "Batch-2024-A",
        "cropType": "Ornamental Plants",
        "totalProduced": 500,
        "deadCrops": 20,
        "soldCrops": 150,
        "remainingCrops": 330
      }
    ]
  }
}
```

---

### GET `/api/batches/:id/stock` 🔒
**Get batch stock details**

**Response:**
```json
{
  "success": true,
  "data": {
    "stock": {
      "batchId": 1,
      "batchName": "Batch-2024-A",
      "totalProduced": 500,
      "soldCrops": 150,
      "deadCrops": 20,
      "remainingCrops": 330
    }
  }
}
```

---

### PUT `/api/batches/:id/dead-crops` 🔒
**Update dead crops count**

**Body:**
```json
{
  "deadCrops": 25
}
```

---

### GET `/api/batches/:id/sales-summary` 🔒
**Get batch sales summary**

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "batchInfo": {
        "id": 1,
        "batchName": "Batch-2024-A",
        "totalProduced": 500,
        "deadCrops": 20
      },
      "salesSummary": {
        "totalSales": 5,
        "totalQuantitySold": 150,
        "totalRevenue": 22500,
        "remainingStock": 330
      }
    }
  }
}
```

---

## Customers

### POST `/api/customers` 🔒
**Create new customer**

**Body:**
```json
{
  "name": "Rajesh Kumar",
  "mobileNumber": "9876543210",
  "address": "123, Green Park, Delhi"
}
```

---

### GET `/api/customers` 🔒
**Get all customers with sales history**

---

### GET `/api/customers/search?q=rajesh` 🔒
**Search customers by name or mobile**

**Query Parameters:**
- `q`: Search query (min 2 characters)

---

### GET `/api/customers/:id` 🔒
**Get customer details with sales**

**Response:**
```json
{
  "success": true,
  "data": {
    "customer": {
      "id": 1,
      "name": "Rajesh Kumar",
      "mobileNumber": "9876543210",
      "totalPurchases": 15000,
      "totalTransactions": 3
    }
  }
}
```

---

## Sales

### POST `/api/sales` 🔒
**Record a new sale**

**Body:**
```json
{
  "batchId": 1,
  "customerId": 1,
  "cropQuantity": 50,
  "pricePerCrop": 150,
  "travelingCost": 200,
  "plantationCost": 0
}
```

**Calculation:**
```
Total = (50 × 150) + 200 + 0 = 7700
```

---

### POST `/api/sales/:id/invoice` 🔒
**Generate PDF invoice**

**Response:**
```json
{
  "success": true,
  "message": "Invoice generated successfully",
  "data": {
    "invoiceNumber": "INV-1-1710234567890",
    "invoicePath": "uploads/invoices/invoice_1_1710234567890.pdf",
    "downloadUrl": "/uploads/invoices/invoice_1_1710234567890.pdf",
    "sale": {
      "id": 1,
      "customerName": "Rajesh Kumar",
      "totalAmount": 7700
    }
  }
}
```

---

### GET `/api/sales/report` 🔒
**Get sales report with filters**

**Query Parameters:**
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD
- `batchId`: (optional) Filter by batch
- `customerId`: (optional) Filter by customer

**Response:**
```json
{
  "success": true,
  "data": {
    "report": {
      "summary": {
        "totalSales": 10,
        "totalQuantity": 500,
        "totalRevenue": 75000,
        "totalTravelingCost": 1500,
        "totalPlantationCost": 500,
        "netRevenue": 73000
      }
    }
  }
}
```

---

## Workers

### POST `/api/workers` 🔒
**Create new worker**

**Body:**
```json
{
  "name": "Suresh Yadav",
  "mobile": "8765432109"
}
```

---

### POST `/api/workers/:id/attendance` 🔒
**Record daily attendance**

**Body:**
```json
{
  "date": "2024-03-12",
  "workType": "FULL_DAY",
  "extraHours": 2,
  "borrowedAmount": 500
}
```

**Work Types:**
- `FULL_DAY`: ₹400
- `HALF_DAY`: ₹200
- Extra hours: ₹50/hour

---

### GET `/api/workers/:id/salary/:month/:year` 🔒
**Calculate monthly salary**

**Example:** `/api/workers/1/salary/3/2024`

**Response:**
```json
{
  "success": true,
  "data": {
    "salary": {
      "workerId": 1,
      "workerName": "Suresh Yadav",
      "month": 3,
      "year": 2024,
      "fullDays": 20,
      "halfDays": 5,
      "totalExtraHours": 10,
      "totalBorrowed": 2000,
      "grossSalary": 9500,
      "netSalary": 7500,
      "breakdown": {
        "fullDayAmount": 8000,
        "halfDayAmount": 1000,
        "extraHourAmount": 500
      }
    }
  }
}
```

**Calculation:**
```
Gross = (20 × 400) + (5 × 200) + (10 × 50) = 9500
Net = 9500 - 2000 = 7500
```

---

## Expenses

### POST `/api/expenses/raw-materials` 🔒
**Add raw material expense**

**Body:**
```json
{
  "materialName": "Organic Soil",
  "quantity": 100,
  "cost": 5000,
  "purchaseDate": "2024-03-12",
  "notes": "High quality soil"
}
```

---

### GET `/api/expenses/monthly/:month/:year` 🔒
**Get monthly raw material expenses**

**Example:** `/api/expenses/monthly/3/2024`

---

### GET `/api/expenses/summary?startDate=&endDate=` 🔒
**Get expense summary for date range**

**Query Parameters:**
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD

---

## Reports

### GET `/api/reports/dashboard` 🔒
**Get dashboard statistics**

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "batches": {
        "total": 5,
        "active": 3
      },
      "customers": {
        "total": 15
      },
      "workers": {
        "total": 8,
        "presentToday": 6
      },
      "revenue": {
        "thisMonth": 125000,
        "month": 3,
        "year": 2024
      }
    }
  }
}
```

---

### GET `/api/reports/monthly/:month/:year` 🔒
**Get comprehensive monthly report**

**Example:** `/api/reports/monthly/3/2024`

**Response:**
```json
{
  "success": true,
  "data": {
    "report": {
      "month": 3,
      "year": 2024,
      "income": {
        "totalIncome": 150000,
        "salesCount": 25
      },
      "expenses": {
        "totalExpenses": 85000,
        "rawMaterialExpenses": 35000,
        "workerSalaries": 50000
      },
      "profit": {
        "grossProfit": 115000,
        "netProfit": 65000,
        "profitMargin": "43.33"
      }
    }
  }
}
```

---

### GET `/api/reports/profit-summary?startDate=&endDate=` 🔒
**Get profit summary for date range**

**Query Parameters:**
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD

---

## Response Format

All responses follow this structure:

**Success:**
```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error"
    }
  ]
}
```

## HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found
- `500`: Internal Server Error

---

**🔒 Protected Endpoints**: Require JWT token in `Authorization: Bearer <token>` header
