/**
 * ProfileImageUpload 컴포넌트 테스트
 *
 * 테스트 범위:
 * - 렌더링
 * - 파일 선택
 * - 파일 검증
 * - 이미지 미리보기
 * - 이미지 제거
 * - 드래그앤드롭
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileImageUpload from '../ProfileImageUpload';

// Mock image utilities
vi.mock('@/lib/utils/image', () => ({
  validateImage: vi.fn((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      return '5MB 이하의 파일을 업로드해주세요';
    }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      return 'JPG, PNG, WebP 형식만 지원합니다';
    }
    return null;
  }),
  cropImageToSquare: vi.fn((file: File) =>
    Promise.resolve(new Blob(['cropped'], { type: 'image/jpeg' }))
  ),
  fileToDataURL: vi.fn((file: File) => Promise.resolve('data:image/jpeg;base64,test')),
}));

describe('ProfileImageUpload', () => {
  const mockOnChange = vi.fn();
  const mockOnPreviewChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render upload area', () => {
    render(<ProfileImageUpload onChange={mockOnChange} />);

    expect(screen.getByText(/클릭 또는 드래그/i)).toBeInTheDocument();
    expect(screen.getByText(/JPG, PNG, WebP/i)).toBeInTheDocument();
  });

  it('should display current image if provided', () => {
    const currentImage = 'https://example.com/avatar.jpg';
    render(<ProfileImageUpload currentImage={currentImage} onChange={mockOnChange} />);

    const img = screen.getByAltText(/프로필 미리보기/i) as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain(currentImage);
  });

  it('should validate file size', async () => {
    render(<ProfileImageUpload onChange={mockOnChange} />);

    // Create a large file (6MB)
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });

    const input = screen.getByRole('button', { hidden: true }) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText(/5MB 이하의 파일을 업로드해주세요/i)).toBeInTheDocument();
    });
  });

  it('should validate file type', async () => {
    render(<ProfileImageUpload onChange={mockOnChange} />);

    // Create an invalid file type
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    const input = screen.getByRole('button', { hidden: true }) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/JPG, PNG, WebP 형식만 지원합니다/i)).toBeInTheDocument();
    });
  });

  it('should accept valid image file', async () => {
    render(<ProfileImageUpload onChange={mockOnChange} onPreviewChange={mockOnPreviewChange} />);

    // Create a valid file
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    const input = screen.getByRole('button', { hidden: true }) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
      expect(mockOnPreviewChange).toHaveBeenCalled();
    });
  });

  it('should show remove button after image is selected', async () => {
    render(<ProfileImageUpload currentImage="https://example.com/avatar.jpg" onChange={mockOnChange} />);

    expect(screen.getByText(/사진 제거/i)).toBeInTheDocument();
  });

  it('should remove image when remove button clicked', () => {
    render(
      <ProfileImageUpload
        currentImage="https://example.com/avatar.jpg"
        onChange={mockOnChange}
        onPreviewChange={mockOnPreviewChange}
      />
    );

    const removeButton = screen.getByText(/사진 제거/i);
    fireEvent.click(removeButton);

    expect(mockOnChange).toHaveBeenCalledWith(null);
    expect(mockOnPreviewChange).toHaveBeenCalledWith(null);
  });

  it('should handle drag and drop', async () => {
    render(<ProfileImageUpload onChange={mockOnChange} onPreviewChange={mockOnPreviewChange} />);

    const dropZone = screen.getByText(/클릭 또는 드래그/i).parentElement!;

    // Create a valid file
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // Simulate drag over
    fireEvent.dragOver(dropZone, { dataTransfer: { files: [validFile] } });

    // Simulate drop
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [validFile] },
    });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });
});
