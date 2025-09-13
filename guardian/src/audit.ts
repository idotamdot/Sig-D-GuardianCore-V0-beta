export type AuditEvent = {
    ts: string; // ISO timestamp
    actor: string; // who initiated
    action: string; // what happened
    target?: string; // optional target/resource
    result: "success" | "failure";
    details?: Record<string, unknown>;
    };
    
    
    export interface AuditSink {
    write: (event: AuditEvent) => Promise<void>;
    }
    
    
    export class ConsoleSink implements AuditSink {
    async write(event: AuditEvent) {
    // eslint-disable-next-line no-console
    console.info("[GUARDIAN]", JSON.stringify(event));
    }
    }
    
    
    export class HttpSink implements AuditSink {
    constructor(private url: string) {}
    async write(event: AuditEvent) {
    await fetch(this.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(event)
    });
    }
    }
    
    
    export class Auditor {
    private sinks: AuditSink[] = [];
    addSink(s: AuditSink) { this.sinks.push(s); return this; }
    async emit(e: Omit<AuditEvent, "ts">) {
    const evt: AuditEvent = { ts: new Date().toISOString(), ...e };
    await Promise.all(this.sinks.map(s => s.write(evt)));
    }
    }