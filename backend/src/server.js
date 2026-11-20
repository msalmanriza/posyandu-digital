import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import orangTuaRoutes from "./routes/orangTuaRoutes.js";
import pesertaRoutes from "./routes/pesertaRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import measurementRoutes from "./routes/measurementRoutes.js";
import immunizationRoutes from "./routes/immunizationRoutes.js";
import vitaminRoutes from "./routes/vitaminRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import skriningLansiaRoutes from "./routes/skriningLansiaRoutes.js";
import pemeriksaanDewasaRoutes from "./routes/pemeriksaanDewasaRoutes.js";
import pemeriksaanRemajaRoutes from "./routes/pemeriksaanRemajaRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import parentRoutes from "./routes/parentRoutes.js";
import devRoutes from "./routes/devRoutes.js";


connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://posyandu-digital-lake.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Izinkan request tanpa origin (seperti curl, Postman, atau server-to-server)
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/posyandu-digital(-[a-z0-9-]+)?-msalmanrizas-projects\.vercel\.app$/.test(origin) ||
        /^https:\/\/posyandu-digital(-[a-z0-9-]+)?\.vercel\.app$/.test(origin);

      if (isAllowed) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/orang-tua", orangTuaRoutes);
app.use("/api/peserta", pesertaRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/immunizations", immunizationRoutes);
app.use("/api/vitamins", vitaminRoutes);
app.use("/api/skrining-lansia", skriningLansiaRoutes);
app.use("/api/pemeriksaan-dewasa", pemeriksaanDewasaRoutes);
app.use("/api/pemeriksaan-remaja", pemeriksaanRemajaRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/parent", parentRoutes);

if (process.env.NODE_ENV !== "production") {
  app.use("/api/dev", devRoutes);
}

app.get("/", (req, res) => {
  res.json({
    message: "Posyandu Digital API",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

export default app;