/**
 * ProfileEditForm 컴포넌트 테스트
 *
 * 테스트 범위:
 * - 렌더링
 * - 폼 검증
 * - 변경사항 감지
 * - 저장 기능
 * - 취소 기능
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileEditForm from '../ProfileEditForm';

// Mock stores
vi.mock('@/stores/profileStore', () => ({
  useProfileStore: vi.fn(() => ({
    profile: {
      full_name: 'Test User',
      bio: 'Test bio',
      avatar_url: 'https://example.com/avatar.jpg',
    },
    updateProfile: vi.fn().mockResolvedValue({ success: true, error: null }),
    uploadAvatar: vi.fn().mockResolvedValue('https://example.com/new-avatar.jpg'),
    saving: false,
  })),
}));

// Mock profile API
vi.mock('@/lib/api/profile-api', () => ({
  deleteProfileImage: vi.fn().mockResolvedValue(true),
}));

describe('ProfileEditForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields', () => {
    render(<ProfileEditForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/이름/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/소개/i)).toBeInTheDocument();
    expect(screen.getByText(/저장/i)).toBeInTheDocument();
    expect(screen.getByText(/취소/i)).toBeInTheDocument();
  });

  it('should pre-fill form with current profile data', () => {
    render(<ProfileEditForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const nameInput = screen.getByLabelText(/이름/i) as HTMLInputElement;
    const bioInput = screen.getByLabelText(/소개/i) as HTMLTextAreaElement;

    expect(nameInput.value).toBe('Test User');
    expect(bioInput.value).toBe('Test bio');
  });

  it('should validate name field (min 2, max 50 characters)', async () => {
    render(<ProfileEditForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const nameInput = screen.getByLabelText(/이름/i);

    // Too short (1 character)
    fireEvent.change(nameInput, { target: { value: 'A' } });
    await waitFor(() => {
      expect(screen.getByText(/이름은 최소 2자 이상/i)).toBeInTheDocument();
    });

    // Too long (51 characters)
    fireEvent.change(nameInput, { target: { value: 'A'.repeat(51) } });
    await waitFor(() => {
      expect(screen.getByText(/이름은 최대 50자까지/i)).toBeInTheDocument();
    });

    // Valid
    fireEvent.change(nameInput, { target: { value: 'Valid Name' } });
    await waitFor(() => {
      expect(screen.queryByText(/이름은/i)).not.toBeInTheDocument();
    });
  });

  it('should validate bio field (max 500 characters)', async () => {
    render(<ProfileEditForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const bioInput = screen.getByLabelText(/소개/i);

    // Too long (501 characters)
    fireEvent.change(bioInput, { target: { value: 'A'.repeat(501) } });
    await waitFor(() => {
      expect(screen.getByText(/소개는 최대 500자까지/i)).toBeInTheDocument();
    });

    // Valid
    fireEvent.change(bioInput, { target: { value: 'Valid bio' } });
    await waitFor(() => {
      expect(screen.queryByText(/소개는/i)).not.toBeInTheDocument();
    });
  });

  it('should disable save button when no changes', () => {
    render(<ProfileEditForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const saveButton = screen.getByText(/저장/i);
    expect(saveButton).toBeDisabled();
  });

  it('should enable save button when form is dirty', async () => {
    render(<ProfileEditForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const nameInput = screen.getByLabelText(/이름/i);
    const saveButton = screen.getByText(/저장/i);

    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });
  });

  it('should call onCancel when cancel button clicked', () => {
    render(<ProfileEditForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByText(/취소/i);
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should show confirmation when canceling with unsaved changes', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<ProfileEditForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const nameInput = screen.getByLabelText(/이름/i);
    const cancelButton = screen.getByText(/취소/i);

    // Make changes
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    // Try to cancel
    fireEvent.click(cancelButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockOnCancel).not.toHaveBeenCalled(); // Canceled confirmation

    confirmSpy.mockRestore();
  });

  it('should submit form and call onSuccess', async () => {
    render(<ProfileEditForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const nameInput = screen.getByLabelText(/이름/i);
    const form = screen.getByRole('form');

    // Make changes
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    // Submit
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
