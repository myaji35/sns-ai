import { describe, it, expect } from 'vitest';
import {
  signUpSchema,
  evaluatePasswordStrength,
} from '@/lib/schemas/auth.schema';

describe('Auth Schema Validation', () => {
  describe('signUpSchema', () => {
    it('should accept valid email and password', () => {
      const result = signUpSchema.safeParse({
        email: 'user@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const result = signUpSchema.safeParse({
        email: 'not-an-email',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_string');
      }
    });

    it('should reject password shorter than 8 characters', () => {
      const result = signUpSchema.safeParse({
        email: 'user@example.com',
        password: 'Short1!',
        confirmPassword: 'Short1!',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('8자'))).toBe(true);
      }
    });

    it('should reject password without uppercase letter', () => {
      const result = signUpSchema.safeParse({
        email: 'user@example.com',
        password: 'lowercase123!',
        confirmPassword: 'lowercase123!',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('대문자'))).toBe(true);
      }
    });

    it('should reject password without number', () => {
      const result = signUpSchema.safeParse({
        email: 'user@example.com',
        password: 'NoNumber!',
        confirmPassword: 'NoNumber!',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('숫자'))).toBe(true);
      }
    });

    it('should reject password without special character', () => {
      const result = signUpSchema.safeParse({
        email: 'user@example.com',
        password: 'NoSpecial123',
        confirmPassword: 'NoSpecial123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('특수문자'))).toBe(true);
      }
    });

    it('should reject mismatched passwords', () => {
      const result = signUpSchema.safeParse({
        email: 'user@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('일치'))).toBe(true);
      }
    });

    it('should normalize email to lowercase', () => {
      const result = signUpSchema.safeParse({
        email: 'User@EXAMPLE.COM',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });
  });

  describe('evaluatePasswordStrength', () => {
    it('should return weak for empty password', () => {
      const result = evaluatePasswordStrength('');
      expect(result.strength).toBe('weak');
      expect(result.score).toBe(0);
    });

    it('should return weak for insufficient criteria met', () => {
      const result = evaluatePasswordStrength('short1');
      expect(result.strength).toBe('weak');
      expect(result.score).toBeLessThan(2);
    });

    it('should return medium for 2-3 criteria met', () => {
      const result = evaluatePasswordStrength('Medium123');
      expect(result.strength).toBe('medium');
      expect(result.score).toBeGreaterThanOrEqual(2);
      expect(result.score).toBeLessThan(4);
    });

    it('should return strong for all criteria met', () => {
      const result = evaluatePasswordStrength('StrongPass123!');
      expect(result.strength).toBe('strong');
      expect(result.score).toBeGreaterThanOrEqual(3);
    });

    it('should return very-strong for all criteria met with length >= 12', () => {
      const result = evaluatePasswordStrength('VeryStrongPass123!');
      expect(result.strength).toBe('very-strong');
      expect(result.score).toBe(4);
    });

    it('should provide helpful messages for unmet criteria', () => {
      const result = evaluatePasswordStrength('short');
      expect(result.messages.length).toBeGreaterThan(0);
      expect(result.messages.some(m => m.includes('8자'))).toBe(true);
    });
  });
});
