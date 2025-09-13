export type GuardianAction =
| "read"
| "write"
| "network"
| "dangerous" // e.g., secrets, destructive ops
| "admin";


export type PolicyContext = {
actor: string; // user id / system id
resource: string; // e.g., path, table, route
meta?: Record<string, unknown>;
};


export type PolicyDecision = { allow: boolean; reason: string };


export type GuardianPolicy = {
name: string;
evaluate: (action: GuardianAction, ctx: PolicyContext) => PolicyDecision;
};


export const AllowAllPolicy: GuardianPolicy = {
name: "allow-all",
evaluate: () => ({ allow: true, reason: "default allow" })
};


export function combinePolicies(...policies: GuardianPolicy[]): GuardianPolicy {
return {
name: `combined(${policies.map(p => p.name).join(",")})`,
evaluate(action, ctx) {
for (const p of policies) {
const d = p.evaluate(action, ctx);
if (!d.allow) return d; // first deny wins
}
return { allow: true, reason: "no policy denied" };
}
};
}