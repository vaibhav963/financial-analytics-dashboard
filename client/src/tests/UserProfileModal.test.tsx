import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserProfileModal } from '../components/auth/UserProfileModal.js';
import { AuthProvider } from '../context/AuthContext.js';
import { ToastProvider } from '../context/ToastContext.js';

// Mock user in context
vi.mock('../services/api.js', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn().mockResolvedValue({
      data: {
        data: {
          accessToken: 'mock-token',
          user: {
            id: 'mock-user-1',
            email: 'analyst@analytics.com',
            name: 'Sarah Chen',
            role: 'analyst',
            title: 'Lead Financial Analyst',
            department: 'Financial Planning & Analysis (FP&A)',
          },
        },
      },
    }),
    put: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'mock-user-1',
          email: 'analyst@analytics.com',
          name: 'Sarah Chen',
          role: 'analyst',
          title: 'Senior Risk Lead',
        },
      },
    }),
  },
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
}));

describe('UserProfileModal Component', () => {
  it('does not render when isOpen is false', async () => {
    const onClose = vi.fn();
    await act(async () => {
      render(
        <ToastProvider>
          <AuthProvider>
            <UserProfileModal isOpen={false} onClose={onClose} />
          </AuthProvider>
        </ToastProvider>
      );
    });
    expect(screen.queryByText(/Analyst Profile/i)).not.toBeInTheDocument();
  });

  it('renders modal form and user metadata when isOpen is true', async () => {
    const onClose = vi.fn();
    await act(async () => {
      render(
        <ToastProvider>
          <AuthProvider>
            <UserProfileModal isOpen={true} onClose={onClose} />
          </AuthProvider>
        </ToastProvider>
      );
    });
    expect(screen.getByText(/Analyst Profile & Workspace Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/Full Legal \/ Display Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Professional Job Title/i)).toBeInTheDocument();
    expect(screen.getByText(/Department \/ Business Unit/i)).toBeInTheDocument();
  });
});
