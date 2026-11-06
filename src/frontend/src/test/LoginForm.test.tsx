import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../components/LoginForm';

describe('LoginForm Component (TDD Frontend)', () => {
  it('should render username, password fields and login button', () => {
    render(<LoginForm onLoginSuccess={vi.fn()} />);

    expect(screen.getByLabelText(/usuário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('should show hint for default admin credentials', () => {
    render(<LoginForm onLoginSuccess={vi.fn()} />);
    expect(screen.getByText(/Credencial Padrão/i)).toBeInTheDocument();
    expect(screen.getAllByText('admin').length).toBeGreaterThan(0);
  });

  it('should trigger onLoginSuccess when valid login occurs', async () => {
    const user = userEvent.setup();
    const handleSuccess = vi.fn();

    // Mock fetch via window.fetch
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '123',
        username: 'admin',
        fullName: 'Admin Teste',
        email: 'admin@teste.com',
        role: 3,
        pointsBalance: 1500,
      }),
    } as any));

    render(<LoginForm onLoginSuccess={handleSuccess} />);

    await user.type(screen.getByLabelText(/usuário/i), 'admin');
    await user.type(screen.getByLabelText(/senha/i), 'admin');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(handleSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'admin', role: 3 })
    );

    vi.unstubAllGlobals();
  });
});
