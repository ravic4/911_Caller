const BASE = `${process.env.SUPABASE_URL}/rest/v1`;
const HEADERS = {
  apikey: process.env.SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
};

export async function log(event, data = {}, status = "ok") {
  const entry = { event, data, status };
  console.log(`[LOG] ${event} | ${status} |`, JSON.stringify(data));
  try {
    await fetch(`${BASE}/logs`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(entry),
    });
  } catch (e) {
    console.error("[LOG] Failed to write to Supabase:", e.message);
  }
}

// Express middleware — logs every incoming request
export function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, path, body, headers } = req;

  res.on("finish", () => {
    log(`${method} ${path}`, {
      status_code: res.statusCode,
      body: body ?? {},
      headers: {
        "content-type": headers["content-type"],
        phone: headers["phone"] ?? null,
        "user-agent": headers["user-agent"] ?? null,
      },
      duration_ms: Date.now() - start,
    }, res.statusCode < 400 ? "ok" : "error");
  });

  next();
}
