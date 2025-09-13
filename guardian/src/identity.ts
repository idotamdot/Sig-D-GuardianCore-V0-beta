export type GuardianIdentity = {
    id: string; // stable id (e.g., "guardian-core")
    displayName: string; // e.g., "Guardian"
    version: string; // semver for the guardian module
    sigil?: string; // optional unicode/emoji/sigil ref
    publicKey?: string; // base64-encoded public key (for verify in browser)
    };
    
    
    export const DefaultGuardianIdentity: GuardianIdentity = {
    id: "guardian-core",
    displayName: "Guardian",
    version: "0.1.0",
    sigil: "⚡",
    };