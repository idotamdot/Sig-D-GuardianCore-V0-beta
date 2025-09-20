// Lightweight signing/verification helpers.
// Node (server): use built-in ed25519 via `crypto`.
// Browser (client): verify only, given server-provided publicKey.

export type KeyPair = {
  publicKey: string; // PEM format
  privateKey: string; // PEM format
};

// Node-only. Generate a new Ed25519 keypair.
export async function generateEd25519KeyPair(): Promise<KeyPair> {
  const { generateKeyPair } = await import("node:crypto");
  return new Promise((resolve, reject) => {
    generateKeyPair(
      "ed25519",
      {
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
      },
      (err, publicKey, privateKey) => {
        if (err) return reject(err);
        resolve({ publicKey, privateKey });
      }
    );
  });
}

export type SignatureBundle = { payload: string; signature: string };


export async function signEd25519Node(payload: string, privateKeyPem: string): Promise<string> {
  // Node-only. Accept a PEM PKCS8 private key.
  const { createPrivateKey, sign } = await import("node:crypto");
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

// Browser-only. Verify a signature given a PEM public key.
export async function verifyEd25519Browser(
  payload: string,
  signatureB64: string,
  publicKeyPem: string
): Promise<boolean> {
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = publicKeyPem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");

  const binaryDer = new Uint8Array(
    atob(pemContents)
      .split("")
      .map(c => c.charCodeAt(0))
  );

  const key = await crypto.subtle.importKey(
    "spki",
    binaryDer,
    { name: "Ed25519", namedCurve: "Ed25519" },
    true,
    ["verify"]
  );

  const signature = new Uint8Array(
    atob(signatureB64)
      .split("")
      .map(c => c.charCodeAt(0))
  );

  return await crypto.subtle.verify(
    "Ed25519",
    key,
    signature,
    new TextEncoder().encode(payload)
  );
}