import type { GuardianMemory, MemoryNamespace } from "./index";


export class LocalStorageMemory implements GuardianMemory {
constructor(private prefix = "guardian") {}
private k(ns: MemoryNamespace, key: string) { return `${this.prefix}:${ns}:${key}`; }
async get(ns: MemoryNamespace, key: string) {
const raw = localStorage.getItem(this.k(ns,key));
return raw ? JSON.parse(raw) : null;
}
async set(ns: MemoryNamespace, key: string, value: unknown) {
localStorage.setItem(this.k(ns,key), JSON.stringify(value));
}
async remove(ns: MemoryNamespace, key: string) { localStorage.removeItem(this.k(ns,key)); }
async list(ns: MemoryNamespace) {
const keys: string[] = [];
for (let i=0;i<localStorage.length;i++) {
const k = localStorage.key(i)!;
if (k.startsWith(`${this.prefix}:${ns}:`)) keys.push(k.split(":").pop()!);
}
return keys;
}
}