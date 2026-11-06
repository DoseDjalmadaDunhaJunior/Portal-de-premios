import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

describe('ProductCard Component', () => {
  const mockProduct: Product = {
    id: 'prod-1',
    title: 'Headphone Bluetooth Pro',
    description: 'Som estéreo imersivo de alta definição',
    pointsCost: 1500,
    category: 'Eletrônicos',
    imageUrl: 'https://img.com/phone.png',
    stock: 12,
    createdAt: new Date().toISOString(),
  };

  it('renders product information properly', () => {
    render(<ProductCard product={mockProduct} userPoints={2000} />);

    expect(screen.getByText('Headphone Bluetooth Pro')).toBeInTheDocument();
    expect(screen.getByText('1.500')).toBeInTheDocument();
    expect(screen.getByText('pts')).toBeInTheDocument();
    expect(screen.getByText('Eletrônicos')).toBeInTheDocument();
  });

  it('indicates when user has enough points and displays redeem button', async () => {
    const handleRedeem = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <ProductCard product={mockProduct} userPoints={2000} onRedeem={handleRedeem} />
    );
    const redeemBtn = screen.getByRole('button', { name: /resgatar prêmio/i });
    expect(redeemBtn).toBeInTheDocument();

    await user.click(redeemBtn);
    expect(handleRedeem).toHaveBeenCalledWith('prod-1');

    rerender(<ProductCard product={mockProduct} userPoints={800} onRedeem={handleRedeem} />);
    expect(screen.getByText(/faltam 700 pts/i)).toBeInTheDocument();
  });

  it('displays out of stock message when stock is zero', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    render(<ProductCard product={outOfStockProduct} userPoints={2000} />);
    expect(screen.getByText(/esgotado/i)).toBeInTheDocument();
  });
});
