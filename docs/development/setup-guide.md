# راهنمای راه‌اندازی محیط توسعه

## مراحل راه‌اندازی

### 1. نصب وابستگی‌ها

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend  
npm install
```

### 2. تنظیم پایگاه داده

```bash
# ایجاد دیتابیس PostgreSQL
createdb haderboon_db

# اجرای migrations
cd backend
npm run db:migrate
```

### 3. اجرای پروژه

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
cd frontend
npm start
```

پروژه در آدرس‌های زیر در دسترس خواهد بود:
- Frontend: http://localhost:3550
- Backend: http://localhost:5550