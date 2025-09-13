export type MemoryNamespace = string;


export interface GuardianMemory {
get(ns: MemoryNamespace, key: string): Promise<unknown | null>;
set(ns: MemoryNamespace, key: string, value: unknown): Promise<void>;
remove(ns: MemoryNamespace, key: string): Promise<void>;
list?(ns: MemoryNamespace): Promise<string[]>; // optional
}


export * from "./memory.inmemory";
export * from "./memory.localstorage";
export * from "./memory.postgres";