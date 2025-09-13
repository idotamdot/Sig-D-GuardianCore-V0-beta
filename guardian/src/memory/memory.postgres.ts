import type { GuardianMemory, MemoryNamespace } from "./index";


// Neon client is user-provided to avoid coupling.
export type NeonClient = { query: (sql: string, params?: unknown[]) => Promise<{ rows: any[] }> };


export class PostgresMemory implements GuardianMemory {
constructor(private sql: NeonClient, private table = "guardian_kv") {}


// SQL bootstrap (run once on server startup)
static initSql(table = "guardian_kv") {
return `CREATE TABLE IF NOT EXISTS ${table} (
ns TEXT NOT NULL,
k TEXT NOT NULL,
v JSONB,
PRIMARY KEY(ns,k)
);`;
}


async get(ns: MemoryNamespace, key: string) {
const { rows } = await this.sql.query(`SELECT v FROM ${this.table} WHERE ns=$1 AND k=$2`, [ns, key]);
return rows[0]?.v ?? null;
}
async set(ns: MemoryNamespace, key: string, value: unknown) {
await this.sql.query(
`INSERT INTO ${this.table}(ns,k,v) VALUES ($1,$2,$3)
ON CONFLICT (ns,k) DO UPDATE SET v=EXCLUDED.v`,
[ns, key, JSON.stringify(value)]
);
}
async remove(ns: MemoryNamespace, key: string) {
await this.sql.query(`DELETE FROM ${this.table} WHERE ns=$1 AND k=$2`, [ns, key]);
}
async list(ns: MemoryNamespace) {
const { rows } = await this.sql.query(`SELECT k FROM ${this.table} WHERE ns=$1`, [ns]);
return rows.map(r => r.k as string);
}
}