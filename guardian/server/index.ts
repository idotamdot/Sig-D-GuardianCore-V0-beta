// server/index.ts
import express from "express";
import { createGuardianServer, guardianMiddleware, requirePolicy } from "@sigilographics/guardian";
import { PostgresMemory, type NeonClient } from "@sigilographics/guardian/memory/memory.postgres";


const app = express();


// Example Neon client adapter (very small wrapper)
import { neon } from "@neondatabase/serverless"; // or your chosen neon client
const sql: NeonClient = { query: async (q: string, params?: unknown[]) => ({ rows: await neon(process.env.DATABASE_URL!)(q, params) }) };


const guardian = createGuardianServer({
// Swap memory to Postgres/Neon
// @ts-ignore path depends on your bundler; adjust import if needed
memory: new PostgresMemory(sql, "guardian_kv")
});


app.use(express.json());
app.use(guardianMiddleware(guardian));


app.get("/api/secret", async (req, res, next) => {
try {
await requirePolicy(guardian, "dangerous", { resource: "/api/secret", actor: "system" });
res.json({ ok: true });
} catch (e) { next(e); }
});


app.use((err: any, _req, res, _next) => {
res.status(err.status || 500).json({ error: err.message || "Internal Error" });
});


app.listen(3000, () => console.log("Server on :3000"));