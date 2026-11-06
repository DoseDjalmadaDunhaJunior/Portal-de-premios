import React, { useState } from 'react';
import { PointTransaction, Campaign, User } from '../types';
import { ArrowDownLeft, ArrowUpRight, History, Filter } from 'lucide-react';

interface StatementViewProps {
  transactions: PointTransaction[];
  campaigns: Campaign[];
  users: User[];
  currentUserId: string;
}

export const StatementView: React.FC<StatementViewProps> = ({
  transactions,
  campaigns,
  currentUserId,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'my' | 'campaign'>('all');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || '');

  const filteredTransactions = transactions.filter((t) => {
    if (filterMode === 'my') {
      return t.userId === currentUserId;
    }
    if (filterMode === 'campaign') {
      return t.campaignId === selectedCampaignId;
    }
    return true;
  });

  return (
    <div className="glass-card" style={{ borderRadius: '20px', padding: '28px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            padding: '12px',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            borderRadius: '14px',
            color: '#818cf8',
          }}>
            <History size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: 700 }}>
              Extrato & Movimentações de Pontos
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Histórico detalhado com timestamps e segregação de contas
            </p>
          </div>
        </div>

        {/* Segregation Tabs */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <button
            onClick={() => setFilterMode('all')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: filterMode === 'all' ? '#4f46e5' : 'transparent',
              color: filterMode === 'all' ? '#ffffff' : '#94a3b8',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Todos os Registros
          </button>
          <button
            onClick={() => setFilterMode('my')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: filterMode === 'my' ? '#4f46e5' : 'transparent',
              color: filterMode === 'my' ? '#ffffff' : '#94a3b8',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Meu Extrato
          </button>
          <button
            onClick={() => setFilterMode('campaign')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: filterMode === 'campaign' ? '#4f46e5' : 'transparent',
              color: filterMode === 'campaign' ? '#ffffff' : '#94a3b8',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Por Campanha
          </button>
        </div>
      </div>

      {filterMode === 'campaign' && campaigns.length > 0 && (
        <div style={{
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <Filter size={18} color="#818cf8" />
          <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600 }}>Filtrar Campanha:</span>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: '#1e293b',
              color: '#ffffff',
              fontSize: '13px',
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
      )}

      {/* Transactions Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)', color: '#94a3b8' }}>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>Tipo</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>Pontos</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>Campanha</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>Beneficiário / Usuário</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>Descrição / Motivo</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>Data & Hora</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  Nenhuma transação encontrada no momento.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isCredit = tx.type === 1; // CampaignCredit

                return (
                  <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: isCredit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                        border: isCredit ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
                        color: isCredit ? '#34d399' : '#a5b4fc',
                      }}>
                        {isCredit ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                        {isCredit ? 'Aporte de Fundo' : 'Distribuição'}
                      </span>
                    </td>
                    <td style={{ padding: '14px', fontWeight: 700, color: '#ffffff' }}>
                      +{tx.points.toLocaleString('pt-BR')} pts
                    </td>
                    <td style={{ padding: '14px', color: '#cbd5e1' }}>
                      {tx.campaignName || '-'}
                    </td>
                    <td style={{ padding: '14px', color: '#cbd5e1' }}>
                      {tx.username || '-'}
                    </td>
                    <td style={{ padding: '14px', color: '#94a3b8' }}>
                      {tx.description}
                    </td>
                    <td style={{ padding: '14px', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(tx.timestamp).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
