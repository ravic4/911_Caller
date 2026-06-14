import { Router } from "express";
import { readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOADS = join(__dirname, "../uploads");

const router = Router();

router.get("/", (_req, res) => {
  try {
    const files = readdirSync(UPLOADS)
      .filter((f) => f.endsWith(".mp3") || f.endsWith(".m4a"))
      .map((f) => {
        const stat = statSync(join(UPLOADS, f));
        return {
          filename: f,
          url: `/uploads/${f}`,
          size_kb: Math.round(stat.size / 1024),
          created_at: stat.birthtime,
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(files);
  } catch {
    res.json([]);
  }
});

export default router;
