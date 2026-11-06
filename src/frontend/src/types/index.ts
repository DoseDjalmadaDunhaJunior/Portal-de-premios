export enum UserRole {
  User = 1,
  Manager = 2,
  Admin = 3,
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  pointsBalance: number;
  createdAt: string;
}

export interface LoginResponse {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  pointsBalance: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: string;
  imageUrl: string;
  stock: number;
  createdAt: string;
}

export enum TransactionType {
  CampaignCredit = 1,
  DistributionToUser = 2,
  Redemption = 3,
}

export interface PointTransaction {
  id: string;
  type: TransactionType;
  points: number;
  campaignId?: string;
  campaignName?: string;
  userId?: string;
  username?: string;
  description: string;
  timestamp: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  totalPointsPool: number;
  availablePoints: number;
  isActive: boolean;
  createdAt: string;
}

export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  createdAt: string;
}
