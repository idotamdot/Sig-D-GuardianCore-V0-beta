import React, { createContext, useContext, useMemo } from "react";
import { DefaultGuardianIdentity, type GuardianIdentity } from "../identity";
import type { GuardianMemory } from "../memory";
import { InMemoryMemory } from "../memory";
import type { GuardianPolicy } from "../policy";
import { AllowAllPolicy } from "../policy";
import { Auditor, ConsoleSink } from "../audit";


import { verifyEd25519Browser } from "../crypto";

export type GuardianClient = {
  id: GuardianIdentity;
  memory: GuardianMemory;
  policy: GuardianPolicy;
  audit: Auditor;
  verify: (payload: string, signature: string) => Promise<boolean>;
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

    async function verify(payload: string, signature: string): Promise<boolean> {
      if (!identity.publicKey) {
        console.warn("Guardian: no public key, cannot verify");
        return false;
      }
      return verifyEd25519Browser(payload, signature, identity.publicKey);
    }

    return {
      id: identity,
      memory: memory ?? new InMemoryMemory(),
      policy: policy ?? AllowAllPolicy,
      audit,
      verify,
    };
  }, [identity, memory, policy]);


return <GuardianCtx.Provider value={value}>{children}</GuardianCtx.Provider>;
}


export function useGuardian(): GuardianClient {
const ctx = useContext(GuardianCtx);
if (!ctx) throw new Error("useGuardian must be used within GuardianProvider");
return ctx;
}