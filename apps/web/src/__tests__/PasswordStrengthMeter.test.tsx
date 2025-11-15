import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';

describe('PasswordStrengthMeter Component', () => {
  it('should not render when password is empty', () => {
    const { container } = render(
      <PasswordStrengthMeter password="" showRequirements={true} />
    );
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it('should display weak strength for weak password', () => {
    render(
      <PasswordStrengthMeter password="weak" showRequirements={true} />
    );
    expect(screen.getByText('약함')).toBeInTheDocument();
  });

  it('should display medium strength for medium password', () => {
    render(
      <PasswordStrengthMeter password="Medium123" showRequirements={true} />
    );
    expect(screen.getByText('보통')).toBeInTheDocument();
  });

  it('should display strong strength for strong password', () => {
    render(
      <PasswordStrengthMeter
        password="StrongPass123!"
        showRequirements={true}
      />
    );
    expect(screen.getByText('강함')).toBeInTheDocument();
  });

  it('should display very-strong strength for very strong password', () => {
    render(
      <PasswordStrengthMeter
        password="VeryStrongPass123!"
        showRequirements={true}
      />
    );
    expect(screen.getByText('매우 강함')).toBeInTheDocument();
  });

  it('should show all requirements when showRequirements is true', () => {
    render(
      <PasswordStrengthMeter
        password="StrongPass123!"
        showRequirements={true}
      />
    );
    expect(screen.getByText('8자 이상')).toBeInTheDocument();
    expect(screen.getByText('대문자 1개 이상')).toBeInTheDocument();
    expect(screen.getByText('숫자 1개 이상')).toBeInTheDocument();
    expect(screen.getByText('특수문자(!@#$%^&*) 1개 이상')).toBeInTheDocument();
  });

  it('should not show requirements when showRequirements is false', () => {
    render(
      <PasswordStrengthMeter
        password="StrongPass123!"
        showRequirements={false}
      />
    );
    expect(screen.queryByText('필수 요구사항:')).not.toBeInTheDocument();
  });

  it('should mark fulfilled requirements with checkmark', () => {
    const { container } = render(
      <PasswordStrengthMeter
        password="StrongPass123!"
        showRequirements={true}
      />
    );
    // Count checkmarks (✓)
    const checkmarks = container.textContent?.match(/✓/g) || [];
    expect(checkmarks.length).toBe(4); // All 4 requirements met
  });

  it('should show missing requirements with circle', () => {
    const { container } = render(
      <PasswordStrengthMeter
        password="weak"
        showRequirements={true}
      />
    );
    // Should have unfulfilled requirements
    expect(container.textContent).toContain('○');
  });
});
