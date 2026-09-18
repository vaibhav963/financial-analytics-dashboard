import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorPage } from '../components/common/ErrorPage.js';

describe('ErrorPage Component', () => {
  it('renders default 500 system error message and incident code', () => {
    render(<ErrorPage statusCode={500} />);
    expect(screen.getByText('500 - Application Exception')).toBeInTheDocument();
    expect(screen.getByText('Unexpected System Error')).toBeInTheDocument();
    expect(screen.getByText('Reload Application')).toBeInTheDocument();
    expect(screen.getByText('Return to Dashboard')).toBeInTheDocument();
  });

  it('renders 404 Not Found state with custom title', () => {
    render(
      <ErrorPage
        statusCode={404}
        title="Transaction Not Found"
        message="The requested transaction record does not exist."
      />
    );
    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
    expect(screen.getByText('Transaction Not Found')).toBeInTheDocument();
    expect(screen.getByText('The requested transaction record does not exist.')).toBeInTheDocument();
  });

  it('renders 403 Access Restricted state', () => {
    render(<ErrorPage statusCode={403} />);
    expect(screen.getByText('403 - Access Restricted')).toBeInTheDocument();
    expect(screen.getByText('Access Permissions Required')).toBeInTheDocument();
  });

  it('calls onRetry callback when reload button is clicked', () => {
    const onRetryMock = vi.fn();
    render(<ErrorPage onRetry={onRetryMock} />);
    fireEvent.click(screen.getByText('Reload Application'));
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });
});
