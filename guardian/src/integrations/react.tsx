import React, { createContext, useContext, useMemo } from "react";
import { DefaultGuardianIdentity, type GuardianIdentity } from "../identity";
import type { GuardianMemory } from "../memory";
import { InMemoryMemory } from "../memory";
import type { GuardianPolicy } from "../policy";
import { AllowAllPolicy } from "../policy";
import { Auditor, ConsoleSink } from "../audit";


export type GuardianClient = {
id: GuardianIdentity;
memory: GuardianMemory;
policy: GuardianPolicy;
audit: Auditor;
};


const GuardianCtx = createContext<GuardianClient | null>(null);


export function GuardianProvider({
children,
identity = DefaultGuardianIdentity,
memory,
policy,
}: {
children: React.ReactNode;
identity?: GuardianIdentity;
memory?: GuardianMemory;
policy?: GuardianPolicy;
}) {
const value: GuardianClient = useMemo(() => {
const audit = new Auditor().addSink(new ConsoleSink());
return {
id: identity,
memory: memory ?? new InMemoryMemory(),
policy: policy ?? AllowAllPolicy,
audit,
};
}, [identity, memory, policy]);


return <GuardianCtx.Provider value={value}>{children}</GuardianCtx.Provider>;
}


export function useGuardian(): GuardianClient {
const ctx = useContext(GuardianCtx);
if (!ctx) throw new Error("useGuardian must be used within GuardianProvider");
return ctx;
}