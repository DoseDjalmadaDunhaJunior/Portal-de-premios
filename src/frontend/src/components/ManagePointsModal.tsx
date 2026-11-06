import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Campaign, User } from '../types';
import { Coins, Send, AlertCircle, X, PlusCircle, ArrowRightLeft } from 'lucide-react';

interface ManagePointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  users: User[];
  onPointsUpdated: () => void;
}

export const ManagePointsModal: React.FC<ManagePointsModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  users,
  onPointsUpdated,
}) => {
  const [tab, setTab] = useState<'distribute' | 'add'>('distribute');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [points, setPoints] = useState<number>(100);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincroniza selects quando abrir modal ou atualizar listas
  useEffect(() => {
    if (campaigns.length > 0 && (!selectedCampaignId || !campaigns.some(c => c.id === selectedCampaignId))) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  useEffect(() => {
    if (users.length > 0 && (!selectedUserId || !users.some(u => u.id === selectedUserId))) {
      setSelectedUserId(users[0].id);
    }
  }, [users, selectedUserId]);

  if (!isOpen) return null;

  const handleAddPointsToCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const campId = selectedCampaignId || (campaigns[0]?.id ?? '');
    if (!campId) {
      setError('Nenhuma campanha selecionada.');
      return;
    }

    setLoading(true);
    try {
      await api.addCampaignPoints(campId, Number(points), description || 'Aporte financeiro à campanha');
      setDescription('');
      onPointsUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar pontos à campanha.');
    } finally {
      setLoading(false);
    }
  };

  const handleDistributePoints = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const campId = selectedCampaignId || (campaigns[0]?.id ?? '');
    const usrId = selectedUserId || (users[0]?.id ?? '');

    if (!campId) {
      setError('Selecione uma campanha de origem.');
      return;
    }
    if (!usrId) {
      setError('Selecione um usuário de destino.');
      return;
    }

    setLoading(true);
    try {
      await api.distributePoints(
        campId,
        usrId,
        Number(points),
        description || 'Reconhecimento por destaque'
      );
      setDescription('');
      onPointsUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao distribuir pontos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px',
    }}>
      <div className="glass-modal animate-fade-in" style={{
        maxWidth: '540px',
        width: '100%',
        padding: '32px',
        borderRadius: '24px',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
          <div style={{
            padding: '12px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '14px',
            color: '#34d399',
          }}>
            <Coins size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: 700 }}>Gestão de Pontos</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Distribua pontos para colaboradores ou realize aportes em campanhas
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '22px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <button
            type="button"
            onClick={() => setTab('distribute')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: tab === 'distribute' ? '#4f46e5' : 'transparent',
              color: tab === 'distribute' ? '#ffffff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <ArrowRightLeft size={16} /> Distribuir para Usuário
          </button>
          <button
            type="button"
            onClick={() => setTab('add')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: tab === 'add' ? '#10b981' : 'transparent',
              color: tab === 'add' ? '#ffffff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <PlusCircle size={16} /> Aporte na Campanha
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '10px',
            padding: '12px 14px',
            color: '#fca5a5',
            fontSize: '13px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {tab === 'distribute' ? (
          <form onSubmit={handleDistributePoints} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Origem: Campanha
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: '#1e293b',
                  color: '#ffffff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Saldo Disponível: {c.availablePoints.toLocaleString('pt-BR')} pts)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Destino: Colaborador
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: '#1e293b',
                  color: '#ffffff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName || u.username} ({u.username}) - Saldo Atual: {u.pointsBalance} pts
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Quantidade de Pontos
              </label>
              <input
                type="number"
                min={1}
                required
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#ffffff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Motivo / Justificativa
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Entrega impecável no trimestre"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#ffffff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="glow-btn-primary"
                style={{
                  padding: '10px 22px',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Send size={16} />
                {loading ? 'Distribuindo...' : 'Distribuir Pontos'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAddPointsToCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Campanha
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: '#1e293b',
                  color: '#ffffff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Pontos a Inserir no Fundo da Campanha
              </label>
              <input
                type="number"
                min={1}
                required
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#ffffff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Descrição do Aporte
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Suplementação orçamentária Q2"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#ffffff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="glow-btn-emerald"
                style={{
                  padding: '10px 22px',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Adicionando...' : 'Adicionar ao Fundo'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
