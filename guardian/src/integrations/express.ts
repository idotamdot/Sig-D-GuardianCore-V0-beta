import type { Request, Response, NextFunction } from "express";
import { DefaultGuardianIdentity, type GuardianIdentity } from "../identity";
import type { GuardianMemory } from "../memory";
import { InMemoryMemory } from "../memory";
import type { GuardianPolicy, GuardianAction, PolicyContext } from "../policy";
import { AllowAllPolicy } from "../policy";
import { Auditor, ConsoleSink } from "../audit";


export type GuardianServer = {
id: GuardianIdentity;
memory: GuardianMemory;
policy: GuardianPolicy;
audit: Auditor;
};


export function createGuardianServer(opts?: Partial<GuardianServer>): GuardianServer {
const audit = new Auditor().addSink(new ConsoleSink());
return {
id: opts?.id ?? DefaultGuardianIdentity,
memory: opts?.memory ?? new InMemoryMemory(),
policy: opts?.policy ?? AllowAllPolicy,
audit,
};
}


// Attach guardian to req and gate actions with policy
export function guardianMiddleware(guardian: GuardianServer) {
return async function(req: Request & { guardian?: GuardianServer }, res: Response, next: NextFunction) {
req.guardian = guardian;
await guardian.audit.emit({ actor: "server", action: "request", target: req.path, result: "success", details: { method: req.method } });
next();
};
}


// Helper to enforce a policy decision inside handlers
export async function requirePolicy(
g: GuardianServer,
action: GuardianAction,
ctx: Omit<PolicyContext, "actor"> & { actor?: string }
) {
const decision = g.policy.evaluate(action, { actor: ctx.actor ?? "server", resource: ctx.resource, meta: ctx.meta });
if (!decision.allow) {
await g.audit.emit({ actor: ctx.actor ?? "server", action: `deny:${action}` , target: ctx.resource, result: "failure", details: { reason: decision.reason } });
const err: any = new Error(decision.reason);
err.status = 403;
throw err;
}
}