# Posyandu Digital

Aplikasi Posyandu Digital berbasis PWA.

## Struktur Folder

```
posyandu-digital/
├── backend/                 # API Server (Express + MongoDB)
│   ├── src/
│   │   ├── config/          # Konfigurasi (koneksi MongoDB)
│   │   ├── models/          # Mongoose models
│   │   ├── controllers/     # Logika handler
│   │   ├── routes/          # Definisi endpoint API
│   │   ├── middleware/      # Middleware custom
│   │   ├── utils/           # Utilitas
│   │   └── server.js        # Entry point backend
│   ├── .env                 # Environment variables
│   └── package.json
└── frontend/                # UI (React + Vite + Tailwind + PWA)
    ├── public/              # Aset statis (icons PWA)
    └── src/
        ├── components/      # Komponen React
        ├── pages/           # Halaman
        ├── services/        # Koneksi API (axios)
        ├── hooks/           # Custom hooks
        ├── utils/           # Utilitas
        ├── styles/          # CSS (Tailwind)
        ├── App.jsx
        └── main.jsx
```

## Menjalankan Backend

```bash
cd backend
npm install
npm run dev
```

Pastikan MongoDB berjalan lokal (URI default: `mongodb://127.0.0.1:27017/posyandu_digital`), atau ubah `MONGODB_URI` di `backend/.env`.

## Menjalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:3000` dengan proxy `/api` menuju backend di port 5000.