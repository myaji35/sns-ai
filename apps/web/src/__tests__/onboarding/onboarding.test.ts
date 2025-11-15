import { describe, it, expect, beforeEach } from 'vitest';
import { validateImage, validateImageSize, validateImageType } from '@/lib/utils/image';

describe('이미지 검증 유틸리티', () => {
  describe('validateImageSize', () => {
    it('5MB 이하 파일은 통과해야 한다', () => {
      const file = new File(['test'], 'test.jpg', {
        type: 'image/jpeg',
      });
      Object.defineProperty(file, 'size', { value: 4 * 1024 * 1024 }); // 4MB

      expect(validateImageSize(file, 5)).toBe(true);
    });

    it('5MB 초과 파일은 실패해야 한다', () => {
      const file = new File(['test'], 'test.jpg', {
        type: 'image/jpeg',
      });
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }); // 6MB

      expect(validateImageSize(file, 5)).toBe(false);
    });
  });

  describe('validateImageType', () => {
    it('JPG 파일은 통과해야 한다', () => {
      const file = new File(['test'], 'test.jpg', {
        type: 'image/jpeg',
      });

      expect(validateImageType(file)).toBe(true);
    });

    it('PNG 파일은 통과해야 한다', () => {
      const file = new File(['test'], 'test.png', {
        type: 'image/png',
      });

      expect(validateImageType(file)).toBe(true);
    });

    it('WebP 파일은 통과해야 한다', () => {
      const file = new File(['test'], 'test.webp', {
        type: 'image/webp',
      });

      expect(validateImageType(file)).toBe(true);
    });

    it('PDF 파일은 실패해야 한다', () => {
      const file = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });

      expect(validateImageType(file)).toBe(false);
    });

    it('GIF 파일은 실패해야 한다', () => {
      const file = new File(['test'], 'test.gif', {
        type: 'image/gif',
      });

      expect(validateImageType(file)).toBe(false);
    });
  });

  describe('validateImage', () => {
    it('올바른 파일은 통과해야 한다 (null 반환)', () => {
      const file = new File(['test'], 'test.jpg', {
        type: 'image/jpeg',
      });
      Object.defineProperty(file, 'size', { value: 2 * 1024 * 1024 }); // 2MB

      expect(validateImage(file)).toBe(null);
    });

    it('잘못된 형식은 에러 메시지를 반환해야 한다', () => {
      const file = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(file, 'size', { value: 2 * 1024 * 1024 });

      const error = validateImage(file);
      expect(error).toBe('JPG, PNG, WebP 형식만 지원합니다');
    });

    it('크기 초과는 에러 메시지를 반환해야 한다', () => {
      const file = new File(['test'], 'test.jpg', {
        type: 'image/jpeg',
      });
      Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }); // 10MB

      const error = validateImage(file);
      expect(error).toBe('5MB 이하의 파일을 업로드해주세요');
    });
  });
});

describe('프로필 스키마 검증', () => {
  it('이름은 2자 이상이어야 한다', async () => {
    const { profileSchema } = await import('@/lib/schemas/auth.schema');

    const result = profileSchema.safeParse({
      fullName: '홍',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('최소 2자');
    }
  });

  it('이름은 50자 이하여야 한다', async () => {
    const { profileSchema } = await import('@/lib/schemas/auth.schema');

    const result = profileSchema.safeParse({
      fullName: 'a'.repeat(51),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('최대 50자');
    }
  });

  it('올바른 이름은 통과해야 한다', async () => {
    const { profileSchema } = await import('@/lib/schemas/auth.schema');

    const result = profileSchema.safeParse({
      fullName: '홍길동',
    });

    expect(result.success).toBe(true);
  });

  it('소개는 500자 이하여야 한다', async () => {
    const { profileSchema } = await import('@/lib/schemas/auth.schema');

    const result = profileSchema.safeParse({
      fullName: '홍길동',
      bio: 'a'.repeat(501),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('최대 500자');
    }
  });

  it('소개는 선택사항이다', async () => {
    const { profileSchema } = await import('@/lib/schemas/auth.schema');

    const result = profileSchema.safeParse({
      fullName: '홍길동',
    });

    expect(result.success).toBe(true);
  });
});
