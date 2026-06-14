import "dotenv/config";
import express from "express";
import cors from "cors";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import agentRouter from "./routes/agent.js";
import alertRouter from "./routes/alert.js";
import uploadRouter from "./routes/upload.js";
import ordersRouter from "./routes/orders.js";
import logsRouter from "./routes/logs.js";
import { requestLogger } from "./services/logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Serve recorded files (optional — lock down in production)
app.use("/uploads", express.static(join(__dirname, "uploads")));

app.use("/api/agent", agentRouter);
app.use("/api/alert", alertRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/logs", logsRouter);

app.get("/health", (_req, res) => res.json({ ok: true, v: 2, routes: ["orders","agent","alert","upload"] }));

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`Safe911 backend running on :${PORT}`));
