// Lightweight signing/verification helpers.
// Node (server): use built-in ed25519 via `crypto`.
// Browser (client): verify only, given server-provided publicKey.


export type SignatureBundle = { payload: string; signature: string };


export async function signEd25519Node(payload: string, privateKeyPem: string): Promise<string> {
// Node-only. Accept a PEM PKCS8 private key.
const { createSign, createPrivateKey } = await import("node:crypto");
// For ed25519 we use sign with null hash via 'sign(null, data, key)' but Node provides sign for ed25519 via sign.one-shot
const { sign } = await import("node:crypto");
const key = createPrivateKey(privateKeyPem);
const sig = sign(null, Buffer.from(payload), key);
return sig.toString("base64");
}


export async function verifyEd25519(payload: string, signatureB64: string, publicKeyPem: string): Promise<boolean> {
const { createPublicKey, verify } = await import("node:crypto");
const key = createPublicKey(publicKeyPem);
const ok = verify(null, Buffer.from(payload), key, Buffer.from(signatureB64, "base64"));
return ok;
}


export function bundle(payload: unknown, signature: string): SignatureBundle {
return { payload: JSON.stringify(payload), signature };
}