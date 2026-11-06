import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { LoginResponse, Product, Campaign, User, PointTransaction, SocialPost, UserRole } from './types';
import { LoginForm } from './components/LoginForm';
import { ProductCard } from './components/ProductCard';
import { PostCard } from './components/PostCard';
import { UserModal } from './components/UserModal';
import { ProductModal } from './components/ProductModal';
import { ManagePointsModal } from './components/ManagePointsModal';
import { StatementView } from './components/StatementView';
import {
  Trophy,
  Gift,
  Users,
  Coins,
  History,
  LogOut,
  MessageSquare,
  Sparkles,
  Send,
  Image as ImageIcon,
  CheckCircle,
  Plus
} from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<LoginResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'catalog' | 'statement'>('feed');

  // Dados carregados da API
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);

  // Post feed form
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Modais
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);

  // Notificação toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadAllData = async () => {
    try {
      const [prodData, campData, usersData, txData, feedData] = await Promise.all([
        api.getProducts().catch(() => []),
        api.getCampaigns().catch(() => []),
        api.getUsers().catch(() => []),
        api.getAllTransactions().catch(() => []),
        api.getFeed().catch(() => []),
      ]);

      setProducts(prodData || []);
      setCampaigns(campData || []);
      setUsers(usersData || []);
      setTransactions(txData || []);
      setPosts(feedData || []);

      // Se usuário logado, atualiza o saldo dele com base nos dados mais recentes
      if (currentUser) {
        const freshUser = (usersData || []).find((u: User) => u.id === currentUser.id);
        if (freshUser) {
          setCurrentUser((prev) => (prev ? { ...prev, pointsBalance: freshUser.pointsBalance } : null));
        }
      }
    } catch (e) {
      console.error('Erro ao sincronizar dados com o backend:', e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser?.id]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !postContent.trim()) return;

    setIsPosting(true);
    try {
      await api.createPost(currentUser.id, postContent, postImageUrl.trim() || undefined);
      setPostContent('');
      setPostImageUrl('');
      showToast('Publicação enviada com sucesso!');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao publicar.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await api.likePost(postId);
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRedeemProduct = async (productId: string) => {
    if (!currentUser) return;
    try {
      await api.redeemProduct(currentUser.id, productId);
      showToast('Prêmio resgatado com sucesso! Seus pontos foram atualizados.');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Erro ao resgatar produto.');
    }
  };

  if (!currentUser) {
    return <LoginForm onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  const roleName =
    currentUser.role === UserRole.Admin
      ? 'Administrador'
      : currentUser.role === UserRole.Manager
      ? 'Gestor'
      : 'Colaborador';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0f19', color: '#f1f5f9' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 100,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          fontSize: '14px',
        }} className="animate-fade-in">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="glass-panel" style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            padding: '10px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            borderRadius: '12px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
          }}>
            <Trophy size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Portal de Prêmios & Recompensas
            </h1>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Plataforma de Reconhecimento & Estudo Acadêmico
            </span>
          </div>
        </div>

        {/* User Balance & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(99, 102, 241, 0.15)',
            borderRadius: '999px',
            border: '1px solid rgba(129, 140, 248, 0.3)',
          }}>
            <Coins size={18} color="#818cf8" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#c7d2fe' }}>
              Saldo: {currentUser.pointsBalance.toLocaleString('pt-BR')} pts
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{currentUser.fullName}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{roleName} ({currentUser.username})</div>
            </div>
            <button
              onClick={() => setCurrentUser(null)}
              title="Sair do portal"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '8px',
                borderRadius: '10px',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px' }}>
        {/* Navigation & Action Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          {/* Main Tabs */}
          <div style={{
            display: 'flex',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '5px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <button
              onClick={() => setActiveTab('feed')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'feed' ? '#4f46e5' : 'transparent',
                color: activeTab === 'feed' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <MessageSquare size={16} /> Feed Social
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'catalog' ? '#4f46e5' : 'transparent',
                color: activeTab === 'catalog' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Gift size={16} /> Catálogo de Prêmios
            </button>
            <button
              onClick={() => setActiveTab('statement')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === 'statement' ? '#4f46e5' : 'transparent',
                color: activeTab === 'statement' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <History size={16} /> Extrato de Pontos
            </button>
          </div>

          {/* Quick Action Buttons for Management */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsPointsModalOpen(true)}
              className="glow-btn-emerald"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Coins size={16} /> Gerenciar Pontos
            </button>

            <button
              onClick={() => setIsProductModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#ffffff',
                borderRadius: '10px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              }}
            >
              <Gift size={16} /> Novo Prêmio
            </button>

            <button
              onClick={() => setIsUserModalOpen(true)}
              className="glow-btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Users size={16} /> Novo Usuário
            </button>
          </div>
        </div>

        {/* Tab 1: FEED SOCIAL */}
        {activeTab === 'feed' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '28px', alignItems: 'start' }}>
            {/* Feed Center */}
            <div>
              {/* Box de Publicação */}
              <div className="glass-card" style={{
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <Sparkles size={18} color="#818cf8" />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>
                    Reconheça ou compartilhe uma conquista com a comunidade
                  </span>
                </div>
                <form onSubmit={handleCreatePost}>
                  <textarea
                    rows={3}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder={`No que você está trabalhando, ${currentUser.fullName}?`}
                    required
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      background: 'rgba(15, 23, 42, 0.6)',
                      color: '#ffffff',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      resize: 'none',
                      marginBottom: '12px',
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input
                        type="url"
                        value={postImageUrl}
                        onChange={(e) => setPostImageUrl(e.target.value)}
                        placeholder="URL de foto/imagem comemorativa (opcional)"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 36px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: 'rgba(15, 23, 42, 0.5)',
                          color: '#ffffff',
                          fontSize: '12px',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                      <ImageIcon size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                    </div>
                    <button
                      type="submit"
                      disabled={isPosting || !postContent.trim()}
                      className="glow-btn-primary"
                      style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: isPosting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Send size={14} />
                      {isPosting ? 'Publicando...' : 'Publicar'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Feed Posts List */}
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onLike={handleLikePost} />
              ))}
            </div>

            {/* Side Card: Campanhas Ativas */}
            <div className="glass-card" style={{ borderRadius: '20px', padding: '24px' }}>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '17px',
                color: '#ffffff',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Trophy size={18} color="#f59e0b" /> Campanhas Ativas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {campaigns.map((camp) => (
                  <div key={camp.id} style={{
                    padding: '14px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#ffffff' }}>{camp.name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', lineHeight: '1.4' }}>
                      {camp.description}
                    </div>
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                    }}>
                      <span style={{ color: '#64748b' }}>Disponível para premiação:</span>
                      <strong style={{ color: '#34d399', fontSize: '13px' }}>
                        {camp.availablePoints.toLocaleString('pt-BR')} pts
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: CATÁLOGO DE PRÊMIOS */}
        {activeTab === 'catalog' && (
          <div>
            <div style={{ marginBottom: '22px' }}>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', color: '#ffffff', fontWeight: 800 }}>
                Catálogo de Prêmios Disponíveis
              </h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                Troque seus pontos acumulados por produtos pré-cadastrados ou adicione novos itens.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  userPoints={currentUser.pointsBalance}
                  onRedeem={handleRedeemProduct}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: EXTRATO SEVERO */}
        {activeTab === 'statement' && (
          <StatementView
            transactions={transactions}
            campaigns={campaigns}
            users={users}
            currentUserId={currentUser.id}
          />
        )}
      </main>

      {/* Modais de Gestão */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onUserCreated={() => {
          loadAllData();
          showToast('Usuário cadastrado com sucesso!');
        }}
      />
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onProductCreated={() => {
          loadAllData();
          showToast('Prêmio cadastrado com sucesso no catálogo!');
        }}
      />
      <ManagePointsModal
        isOpen={isPointsModalOpen}
        onClose={() => setIsPointsModalOpen(false)}
        campaigns={campaigns}
        users={users}
        onPointsUpdated={() => {
          loadAllData();
          showToast('Operação de pontos realizada com sucesso!');
        }}
      />
    </div>
  );
}

export default App;
