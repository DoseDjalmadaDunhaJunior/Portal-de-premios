const API_BASE = 'http://localhost:5000/api';

export const api = {
  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao autenticar.');
    }
    return res.json();
  },

  async getUsers() {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('Erro ao listar usuários');
    return res.json();
  },

  async createUser(data: { username: string; password: string; fullName: string; email: string; role: number }) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao cadastrar usuário.');
    }
    return res.json();
  },

  async getProducts() {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('Erro ao listar produtos');
    return res.json();
  },

  async createProduct(data: { title: string; description: string; pointsCost: number; category: string; imageUrl: string; stock: number }) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao cadastrar produto.');
    }
    return res.json();
  },

  async redeemProduct(userId: string, productId: string) {
    const res = await fetch(`${API_BASE}/products/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao resgatar produto.');
    }
    return res.json();
  },

  async getCampaigns() {
    const res = await fetch(`${API_BASE}/points/campaigns`);
    if (!res.ok) throw new Error('Erro ao listar campanhas');
    return res.json();
  },

  async createCampaign(name: string, description: string) {
    const res = await fetch(`${API_BASE}/points/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) throw new Error('Erro ao criar campanha');
    return res.json();
  },

  async addCampaignPoints(campaignId: string, points: number, description: string) {
    const res = await fetch(`${API_BASE}/points/campaigns/add-points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, points, description }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao creditar campanha.');
    }
    return res.json();
  },

  async distributePoints(campaignId: string, userId: string, points: number, reason: string) {
    const res = await fetch(`${API_BASE}/points/distribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, userId, points, reason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao distribuir pontos.');
    }
    return res.json();
  },

  async getCampaignStatement(campaignId: string) {
    const res = await fetch(`${API_BASE}/points/statement/campaign/${campaignId}`);
    if (!res.ok) return [];
    return res.json();
  },

  async getUserStatement(userId: string) {
    const res = await fetch(`${API_BASE}/points/statement/user/${userId}`);
    if (!res.ok) return [];
    return res.json();
  },

  async getAllTransactions() {
    const res = await fetch(`${API_BASE}/points/transactions`);
    if (!res.ok) return [];
    return res.json();
  },

  async getFeed() {
    const res = await fetch(`${API_BASE}/socialfeed`);
    if (!res.ok) throw new Error('Erro ao carregar feed social');
    return res.json();
  },

  async createPost(authorId: string, content: string, imageUrl?: string) {
    const res = await fetch(`${API_BASE}/socialfeed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId, content, imageUrl }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao publicar post.');
    }
    return res.json();
  },

  async likePost(postId: string) {
    const res = await fetch(`${API_BASE}/socialfeed/${postId}/like`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Erro ao curtir post');
    return res.json();
  },
};
