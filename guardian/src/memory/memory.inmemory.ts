import type { GuardianMemory, MemoryNamespace } from "./index";


export class InMemoryMemory implements GuardianMemory {
private store = new Map<string, unknown>();
private k(ns: MemoryNamespace, key: string) { return `${ns}:${key}`; }
async get(ns: MemoryNamespace, key: string) { return this.store.get(this.k(ns,key)) ?? null; }
async set(ns: MemoryNamespace, key: string, value: unknown) { this.store.set(this.k(ns,key), value); }
async remove(ns: MemoryNamespace, key: string) { this.store.delete(this.k(ns,key)); }
async list(ns: MemoryNamespace) { return [...this.store.keys()].filter(k => k.startsWith(`${ns}:`)).map(k => k.split(":")[1]); }
}