import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AccountDeletionModal from '../AccountDeletionModal';

// Mock react-hook-form
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useForm: () => ({
      register: vi.fn(),
      handleSubmit: (fn: any) => (e: any) => {
        e.preventDefault();
        return fn({ email: 'test@example.com' });
      },
      formState: {
        errors: {},
        isValid: true,
      },
      reset: vi.fn(),
    }),
  };
});

describe('AccountDeletionModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();
  const userEmail = 'test@example.com';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when isOpen is true', () => {
    render(
      <AccountDeletionModal
        isOpen={true}
        userEmail={userEmail}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('계정 삭제')).toBeInTheDocument();
    expect(screen.getByText(/주의: 되돌릴 수 없는 작업입니다/)).toBeInTheDocument();
  });

  it('should not render modal when isOpen is false', () => {
    render(
      <AccountDeletionModal
        isOpen={false}
        userEmail={userEmail}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByText('계정 삭제')).not.toBeInTheDocument();
  });

  it('should display user email', () => {
    render(
      <AccountDeletionModal
        isOpen={true}
        userEmail={userEmail}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(userEmail)).toBeInTheDocument();
  });

  it('should display warning message', () => {
    render(
      <AccountDeletionModal
        isOpen={true}
        userEmail={userEmail}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(
      screen.getByText(/계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다/)
    ).toBeInTheDocument();
  });

  it('should display list of data to be deleted', () => {
    render(
      <AccountDeletionModal
        isOpen={true}
        userEmail={userEmail}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/프로필 정보/)).toBeInTheDocument();
    expect(screen.getByText(/계정 인증 정보/)).toBeInTheDocument();
    expect(screen.getByText(/사용자 설정/)).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <AccountDeletionModal
        isOpen={true}
        userEmail={userEmail}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: '취소' });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm when form is submitted with valid email', async () => {
    mockOnConfirm.mockResolvedValue(undefined);

    render(
      <AccountDeletionModal
        isOpen={true}
        userEmail={userEmail}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: '계정 삭제' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it('should show loading state during deletion', async () => {
    mockOnConfirm.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(
      <AccountDeletionModal
        isOpen={true}
        userEmail={userEmail}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: '계정 삭제' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('삭제 중...')).toBeInTheDocument();
    });
  });

  it('should have email input field', () => {
    render(
      <AccountDeletionModal
        isOpen={true}
        userEmail={userEmail}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const emailInput = screen.getByLabelText(
      /계정 삭제를 확인하려면 이메일을 입력하세요/
    );
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('should close modal when clicking overlay', () => {
    render(
      <AccountDeletionModal
        isOpen={true}
        userEmail={userEmail}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Find overlay (backdrop)
    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50');
    expect(overlay).toBeInTheDocument();

    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnCancel).toHaveBeenCalled();
    }
  });

  it('should be mobile responsive', () => {
    render(
      <AccountDeletionModal
        isOpen={true}
        userEmail={userEmail}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Modal content should have responsive classes
    const modalContent = document.querySelector('.max-w-md');
    expect(modalContent).toBeInTheDocument();
  });
});
