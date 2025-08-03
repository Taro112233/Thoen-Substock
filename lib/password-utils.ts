// lib/password-utils.ts - ใหม่
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

/**
 * Hash password ด้วย Node.js crypto (scrypt)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Verify password กับ hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const [hashedPwd, salt] = hashedPassword.split(".");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    const hashedBuffer = Buffer.from(hashedPwd, "hex");
    
    return timingSafeEqual(hashedBuffer, buf);
  } catch {
    return false;
  }
}