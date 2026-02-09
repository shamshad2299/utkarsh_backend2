import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "../src/routes/userRoutes.js";
import adminRoutes from "../src/routes/adminRoutes.js";
import categoryRoutes from "../src/routes/categoryRoutes.js";
import subCategoryRoutes from "../src/routes/subCategoryRoutes.js";
import eventRoutes from "../src/routes/eventRoutes.js";
import registrationRoutes from "../src/routes/registrationRoutes.js";
import teamRoutes from "../src/routes/teamRoutes.js";
import resultRoutes from "../src/routes/resultRoutes.js";
import foodStallRoutes from "../src/routes/foodStallRoutes.js";
import sponsorshipRoutes from "../src/routes/sponsorshipRoutes.js";
import auditLogRoutes from "../src/routes/auditLogRoutes.js";
import {globalErrorHandler} from "./middlewares/errorMiddleware.js"
import { notFoundHandler } from "./middlewares/notFoundMiddleware.js";
import throwbackRoutes from  "../src/routes/throwbackRoutes.js"
import websiteTeamRoutes from "../src/routes/websiteTeamRoutes.js"

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT","PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [ "Content-Type","Authorization" ]
}));



app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
    parameterLimit: 50,
    type: "application/x-www-form-urlencoded",
  })
);

app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    name: "utkarsh Backend",
    status: "active",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/admin/auth", adminRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/subCategory", subCategoryRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/v1/admin/audit-logs", auditLogRoutes);
app.use("/api/food-stalls", foodStallRoutes);
app.use("/api/sponsorships", sponsorshipRoutes);
app.use("/api/throwbacks", throwbackRoutes);
app.use("/api/website-team", websiteTeamRoutes);
/* ================= 404 HANDLER ================= */
app.use(notFoundHandler);

/* ================= GLOBAL ERROR HANDLER (ALWAYS LAST) ================= */
app.use(globalErrorHandler);

export { app };
