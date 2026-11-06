import React, { useState } from 'react';
import { Product } from '../types';
import { CheckCircle, Clock, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  userPoints: number;
  onRedeem?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, userPoints, onRedeem }) => {
  const hasEnough = userPoints >= product.pointsCost;
  const isAvailable = hasEnough && product.stock > 0;
  const missingPoints = product.pointsCost - userPoints;
  const [redeeming, setRedeeming] = useState(false);

  const handleRedeemClick = async () => {
    if (!isAvailable || !onRedeem) return;
    setRedeeming(true);
    try {
      await onRedeem(product.id);
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="glass-card" style={{
      borderRadius: '18px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ height: '200px', overflow: 'hidden', position: 'relative', background: '#1e293b' }}>
        <img
          src={product.imageUrl}
          alt={product.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
        <span style={{
          position: 'absolute',
          top: '14px',
          right: '14px',
          background: 'rgba(15, 23, 42, 0.85)',
          color: '#e2e8f0',
          padding: '4px 12px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: 600,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(8px)',
        }}>
          {product.category}
        </span>
        <span style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(15, 23, 42, 0.8)',
          color: product.stock > 0 ? '#94a3b8' : '#f87171',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 600,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          Estoque: {product.stock} un
        </span>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#ffffff', fontWeight: 700, lineHeight: '1.3' }}>
          {product.title}
        </h3>
        <p style={{ margin: '0 0 18px 0', fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', flex: 1 }}>
          {product.description}
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '16px',
          marginTop: 'auto',
          gap: '10px',
        }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', fontWeight: 600 }}>
              Custo de Resgate
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{product.pointsCost.toLocaleString('pt-BR')}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#a5b4fc' }}>pts</span>
            </div>
          </div>

          <div>
            {isAvailable ? (
              <button
                type="button"
                onClick={handleRedeemClick}
                disabled={redeeming}
                className="glow-btn-emerald"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: redeeming ? 'not-allowed' : 'pointer',
                }}
              >
                <ShoppingBag size={15} />
                <span>{redeeming ? 'Resgatando...' : 'Resgatar Prêmio'}</span>
              </button>
            ) : product.stock <= 0 ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
              }}>
                Esgotado
              </span>
            ) : (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fbbf24',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
              }}>
                <Clock size={14} /> Faltam {missingPoints.toLocaleString('pt-BR')} pts
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
