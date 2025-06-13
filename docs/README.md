# دستیار برنامه‌نویسی هادربون (Haderboon Programming Assistant)

دستیار هوشمند برای مستندسازی خودکار پروژه‌های نرم‌افزاری و تولید پرامپت‌های بهینه برای AI کدنویس.

## تکنولوژی‌ها

- **Frontend**: React 18.2 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **AI**: Google Gemini + OpenRouter

## راه‌اندازی سریع

### پیش‌نیازها

- Node.js 18+
- PostgreSQL
- npm/yarn

### نصب

```bash
# Frontend
cd frontend
npm install
npm start

# Backend  
cd backend
npm install
npm run db:generate
npm run dev
```

## مستندات

- [راهنمای کاربر](docs/user-guide/)
- [مستندات API](docs/api/)
- [معماری سیستم](docs/architecture/)

---

**توسعه‌دهنده**: مجتبی حسنی - مجتمع کامپیوتر یک دو سه کرمان
EOF

# ایجاد مستندات اولیه

cat > development/setup-guide.md << 'EOF'
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