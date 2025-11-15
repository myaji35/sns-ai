/**
 * 이미지 처리 유틸리티 함수
 */

/**
 * 이미지를 정사각형으로 크롭
 * @param file - 원본 이미지 파일
 * @param size - 출력 크기 (기본값: 400x400)
 * @returns 크롭된 이미지 Blob
 */
export async function cropImageToSquare(file: File, size: number = 400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // 정사각형으로 크롭하기 위한 계산
      const minDimension = Math.min(img.width, img.height);
      const sx = (img.width - minDimension) / 2;
      const sy = (img.height - minDimension) / 2;

      // Canvas 크기 설정
      canvas.width = size;
      canvas.height = size;

      // 이미지 그리기 (크롭 + 리사이즈)
      ctx.drawImage(
        img,
        sx,
        sy,
        minDimension,
        minDimension,
        0,
        0,
        size,
        size
      );

      // Canvas를 Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        0.9 // 품질 90%
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // 이미지 로드
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 여러 크기의 이미지 생성 (100x100, 200x200, 400x400)
 * @param file - 원본 이미지 파일
 * @returns 크기별 이미지 Blob 배열
 */
export async function generateMultipleSizes(
  file: File
): Promise<{ size: number; blob: Blob }[]> {
  const sizes = [100, 200, 400];
  const results = await Promise.all(
    sizes.map(async (size) => ({
      size,
      blob: await cropImageToSquare(file, size),
    }))
  );
  return results;
}

/**
 * 이미지를 WebP 형식으로 변환
 * @param file - 원본 이미지 파일
 * @param quality - 품질 (0.0 ~ 1.0, 기본값: 0.8)
 * @returns WebP 형식의 Blob
 */
export async function convertToWebP(file: File, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      // WebP로 변환
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create WebP blob'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * File을 Data URL로 변환 (미리보기용)
 * @param file - 이미지 파일
 * @returns Data URL (base64)
 */
export async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 이미지 파일 크기 검증
 * @param file - 검증할 파일
 * @param maxSizeMB - 최대 크기 (MB, 기본값: 5MB)
 * @returns 유효 여부
 */
export function validateImageSize(file: File, maxSizeMB: number = 5): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * 이미지 파일 형식 검증
 * @param file - 검증할 파일
 * @returns 유효 여부
 */
export function validateImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}

/**
 * 이미지 파일 전체 검증 (크기 + 형식)
 * @param file - 검증할 파일
 * @returns 에러 메시지 또는 null
 */
export function validateImage(file: File): string | null {
  if (!validateImageType(file)) {
    return 'JPG, PNG, WebP 형식만 지원합니다';
  }
  if (!validateImageSize(file, 5)) {
    return '5MB 이하의 파일을 업로드해주세요';
  }
  return null;
}
