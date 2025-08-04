// lib/password-utils.ts - Password utilities using Node.js crypto
import { createHash, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Hash password using scrypt with salt
 * @param password - Plain text password
 * @returns Promise<string> - Hashed password with salt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // Generate a random salt
    const salt = randomBytes(16).toString('hex');
    
    // Hash the password with the salt using scrypt
    const hashedBuffer = (await scryptAsync(password, salt, 64)) as Buffer;
    const hashedPassword = hashedBuffer.toString('hex');
    
    // Return salt + hash combined
    return `${salt}:${hashedPassword}`;
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify password against hashed password
 * @param password - Plain text password to verify
 * @param hashedPassword - Stored hashed password with salt
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // Split the stored hash to get salt and hash
    const [salt, hash] = hashedPassword.split(':');
    
    if (!salt || !hash) {
      console.error('Invalid hash format');
      return false;
    }
    
    // Hash the provided password with the same salt
    const hashedBuffer = (await scryptAsync(password, salt, 64)) as Buffer;
    const hashedAttempt = hashedBuffer.toString('hex');
    
    // Compare the hashes using timing-safe comparison
    return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashedAttempt, 'hex'));
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Timing-safe comparison to prevent timing attacks
 * @param a - First buffer to compare
 * @param b - Second buffer to compare
 * @returns boolean - True if buffers are equal
 */
function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  
  return result === 0;
}

/**
 * Generate a secure random token
 * @param length - Length of the token in bytes (default: 32)
 * @returns string - Random token in hex format
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate a simple hash (for non-sensitive data)
 * @param data - Data to hash
 * @returns string - SHA-256 hash
 */
export function simpleHash(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation results
 */
export function validatePasswordStrength(password: string) {
  const checks = {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  
  return {
    ...checks,
    score,
    isValid: checks.minLength && checks.hasLowercase && checks.hasUppercase && checks.hasNumber,
    strength: score >= 5 ? 'strong' : score >= 4 ? 'good' : score >= 3 ? 'fair' : 'weak'
  };
}

/**
 * Generate a temporary password
 * @param length - Length of password (default: 12)
 * @returns string - Temporary password
 */
export function generateTempPassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}