/**
 * Simple encryption for song answers
 * Uses a secret key stored in Supabase secrets
 */

const ALGORITHM = "AES-GCM";

/**
 * Get encryption key from environment
 */
async function getKey(): Promise<CryptoKey> {
  const secret = Deno.env.get("ANSWER_ENCRYPTION_KEY");
  if (!secret) {
    throw new Error("ANSWER_ENCRYPTION_KEY not configured");
  }
  
  // Derive a key from the secret
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret.padEnd(32, '0').slice(0, 32)),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("daily-song-salt"),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a plaintext answer
 */
export async function encryptAnswer(plaintext: string): Promise<string> {
  const key = await getKey();
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext)
  );
  
  // Combine IV and ciphertext, encode as base64
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt an encrypted answer
 */
export async function decryptAnswer(ciphertext: string): Promise<string> {
  const key = await getKey();
  const decoder = new TextDecoder();
  
  // Decode base64
  const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  
  // Extract IV and ciphertext
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted
  );
  
  return decoder.decode(decrypted);
}

/**
 * Hash an answer for comparison (used when we can't encrypt/decrypt)
 * This is a fallback for when encryption key isn't set
 */
export async function hashAnswer(answer: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(answer);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compare a guess with the encrypted answer
 * Returns true if correct
 */
export async function verifyAnswer(guess: string, encryptedAnswer: string): Promise<boolean> {
  try {
    const correctAnswer = await decryptAnswer(encryptedAnswer);
    return guess === correctAnswer;
  } catch (error) {
    console.error("Error verifying answer:", error);
    return false;
  }
}
